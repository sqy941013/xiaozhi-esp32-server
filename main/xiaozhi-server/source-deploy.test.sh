#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=source-deploy.sh
source "${script_dir}/source-deploy.sh"

backup_database() {
  :
}

deploy_tag() {
  [[ "$1" == "local" ]]
}

write_state() {
  current_tag="$1"
  previous_tag="$2"
}

current_tag="react-release"
previous_tag="local"
output_file="$(mktemp)"
trap 'unlink "${output_file}"' EXIT
rollback > "${output_file}"
IFS= read -r output < "${output_file}"

[[ "${current_tag}" == "local" ]]
[[ "${previous_tag}" == "react-release" ]]
[[ "${output}" == "Rollback complete: local" ]]

compose_json="$(docker compose \
  --env-file "${script_dir}/source.env.example" \
  -f "${script_dir}/docker-compose.source.yml" \
  config --format json)"
python3 -c '
import json
import sys

services = json.load(sys.stdin)["services"]
python_service = "xiaozhi-esp32-server"
manager_service = "xiaozhi-esp32-server-web"
python_dependencies = services[python_service].get("depends_on", {})
manager_dependencies = services[manager_service].get("depends_on", {})
if manager_service in python_dependencies or python_service in manager_dependencies:
    raise SystemExit("application services must boot independently")
' <<< "${compose_json}"

echo "source-deploy regression tests passed"
