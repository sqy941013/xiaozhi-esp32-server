#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_dir}"

if [[ -n "${XIAOZHI_COMPOSE_FILE:-}" ]]; then
  compose_file="${XIAOZHI_COMPOSE_FILE}"
elif [[ -f docker-compose.source.yml ]]; then
  compose_file="docker-compose.source.yml"
else
  compose_file="docker-compose.yml"
fi

user_env="${XIAOZHI_ENV_FILE:-.env}"
state_file="${XIAOZHI_DEPLOY_STATE_FILE:-.deploy.env}"
wait_timeout="${XIAOZHI_DEPLOY_WAIT_TIMEOUT:-360}"
if [[ ! "${wait_timeout}" =~ ^[1-9][0-9]*$ ]]; then
  echo "XIAOZHI_DEPLOY_WAIT_TIMEOUT must be a positive integer." >&2
  exit 2
fi

read_env_value() {
  local key="$1"
  local file="$2"
  [[ -f "${file}" ]] || return 1
  awk -F= -v key="${key}" '
    $1 == key {
      sub(/^[^=]*=/, "")
      sub(/\r$/, "")
      print
      exit
    }
  ' "${file}"
}

validate_tag() {
  local tag="$1"
  if [[ ! "${tag}" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$ ]]; then
    echo "Invalid Docker image tag: ${tag}" >&2
    return 1
  fi
}

current_tag="$(read_env_value XIAOZHI_IMAGE_TAG "${state_file}" || true)"
current_tag="${current_tag:-local}"
previous_tag="$(read_env_value XIAOZHI_PREVIOUS_IMAGE_TAG "${state_file}" || true)"
validate_tag "${current_tag}"
[[ -z "${previous_tag}" ]] || validate_tag "${previous_tag}"

compose_for_tag() {
  local tag="$1"
  shift
  local -a command=(docker compose)
  [[ ! -f "${user_env}" ]] || command+=(--env-file "${user_env}")
  [[ ! -f "${state_file}" ]] || command+=(--env-file "${state_file}")
  command+=(-f "${compose_file}")
  XIAOZHI_IMAGE_TAG="${tag}" "${command[@]}" "$@"
}

write_state() {
  local deployed="$1"
  local previous="$2"
  local temporary
  umask 077
  temporary="$(mktemp "${state_file}.tmp.XXXXXX")"
  printf 'XIAOZHI_IMAGE_TAG=%s\nXIAOZHI_PREVIOUS_IMAGE_TAG=%s\n' \
    "${deployed}" "${previous}" > "${temporary}"
  mv "${temporary}" "${state_file}"
  current_tag="${deployed}"
  previous_tag="${previous}"
}

runtime_dir="${XIAOZHI_RUNTIME_DIR:-$(read_env_value XIAOZHI_RUNTIME_DIR "${user_env}" || true)}"
runtime_dir="${runtime_dir:-.}"
if [[ "${runtime_dir}" != /* ]]; then
  runtime_dir="${script_dir}/${runtime_dir}"
fi
backup_dir="${XIAOZHI_BACKUP_DIR:-${runtime_dir}/backups}"

backup_database() {
  if ! compose_for_tag "${current_tag}" ps --status running --services \
    | awk '$0 == "xiaozhi-esp32-server-db" { found = 1 } END { exit !found }'; then
    echo "Database is not running; skipping logical backup."
    return 0
  fi

  local stamp target partial
  stamp="$(date -u +%Y%m%dT%H%M%S%NZ)"
  mkdir -p "${backup_dir}"
  target="${backup_dir}/xiaozhi-${stamp}.sql.gz"
  partial="${target}.partial"
  umask 077

  if compose_for_tag "${current_tag}" exec -T xiaozhi-esp32-server-db \
    sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --routines --events xiaozhi_esp32_server' \
    | gzip > "${partial}"; then
    gzip -t "${partial}"
    mv "${partial}" "${target}"
    echo "Database backup: ${target}"
  else
    [[ ! -e "${partial}" ]] || unlink "${partial}"
    echo "Database backup failed; deployment was not changed." >&2
    return 1
  fi
}

source_dir="${XIAOZHI_SOURCE_DIR:-$(read_env_value XIAOZHI_SOURCE_DIR "${user_env}" || true)}"
source_dir="${source_dir:-../..}"
if [[ "${source_dir}" != /* ]]; then
  source_dir="${script_dir}/${source_dir}"
fi

new_tag() {
  local revision suffix=""
  revision="$(git -C "${source_dir}" rev-parse --short=12 HEAD 2>/dev/null || printf source)"
  if [[ -n "$(git -C "${source_dir}" status --porcelain --untracked-files=normal 2>/dev/null || true)" ]]; then
    suffix="-dirty"
  fi
  printf '%s-%s%s\n' "$(date -u +%Y%m%dT%H%M%SZ)" "${revision}" "${suffix}"
}

ensure_infrastructure() {
  local tag="$1"
  local service container_id state health
  local -a missing=()

  for service in xiaozhi-esp32-server-db xiaozhi-esp32-server-redis; do
    container_id="$(compose_for_tag "${tag}" ps -q "${service}")"
    if [[ -z "${container_id}" ]]; then
      missing+=("${service}")
      continue
    fi

    state="$(docker inspect --format '{{.State.Status}}' "${container_id}")"
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${container_id}")"
    if [[ "${state}" != "running" || ( "${health}" != "healthy" && "${health}" != "none" ) ]]; then
      echo "Infrastructure service ${service} is ${state}/${health}; fix it before deploying application images." >&2
      return 1
    fi
  done

  if (( ${#missing[@]} > 0 )); then
    compose_for_tag "${tag}" up -d --wait --wait-timeout "${wait_timeout}" "${missing[@]}"
  fi
}

deploy_tag() {
  local tag="$1"
  ensure_infrastructure "${tag}"
  compose_for_tag "${tag}" up -d --no-deps --wait --wait-timeout "${wait_timeout}" \
    xiaozhi-esp32-server xiaozhi-esp32-server-web
}

upgrade() {
  local tag="${1:-$(new_tag)}"
  validate_tag "${tag}"
  if [[ "${tag}" == "${current_tag}" ]]; then
    echo "Refusing to overwrite the active immutable tag: ${tag}" >&2
    return 1
  fi

  compose_for_tag "${current_tag}" config --quiet
  backup_database

  local -a pull_args=()
  [[ "${XIAOZHI_BUILD_PULL:-0}" != "1" ]] || pull_args+=(--pull)
  compose_for_tag "${tag}" build "${pull_args[@]}" \
    xiaozhi-esp32-server xiaozhi-esp32-server-web

  if deploy_tag "${tag}"; then
    write_state "${tag}" "${current_tag}"
    echo "Deployment complete: ${tag}"
  else
    echo "Deployment health check failed; restoring ${current_tag}." >&2
    deploy_tag "${current_tag}" || true
    return 1
  fi
}

rollback() {
  if [[ -z "${previous_tag}" ]]; then
    echo "No previous image tag is recorded in ${state_file}." >&2
    return 1
  fi

  backup_database
  local replaced="${current_tag}"
  local target="${previous_tag}"
  deploy_tag "${target}"
  write_state "${target}" "${replaced}"
  echo "Rollback complete: ${target}"
}

status() {
  printf 'Current image tag: %s\n' "${current_tag}"
  printf 'Previous image tag: %s\n' "${previous_tag:-none}"
  compose_for_tag "${current_tag}" ps
}

usage() {
  cat <<'EOF'
Usage: ./source-deploy.sh COMMAND [IMAGE_TAG]

Commands:
  upgrade [tag]  Back up MySQL, build both local images, deploy, and wait healthy.
  rollback       Switch both application images to the previously healthy tag.
  backup         Create a compressed logical MySQL backup.
  status         Show active/previous tags and Compose service status.
  config         Validate the fully rendered Compose configuration.
EOF
}

main() {
  case "${1:-}" in
    upgrade)
      upgrade "${2:-}"
      ;;
    rollback)
      rollback
      ;;
    backup)
      backup_database
      ;;
    status)
      status
      ;;
    config)
      compose_for_tag "${current_tag}" config --quiet
      ;;
    *)
      usage
      [[ -z "${1:-}" ]] || return 2
      ;;
  esac
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
