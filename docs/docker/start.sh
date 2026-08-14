#!/usr/bin/env bash
set -Eeuo pipefail

: "${SPRING_DATASOURCE_DRUID_URL:?SPRING_DATASOURCE_DRUID_URL is required}"
: "${SPRING_DATASOURCE_DRUID_USERNAME:?SPRING_DATASOURCE_DRUID_USERNAME is required}"
: "${SPRING_DATASOURCE_DRUID_PASSWORD:?SPRING_DATASOURCE_DRUID_PASSWORD is required}"
: "${SPRING_DATA_REDIS_HOST:?SPRING_DATA_REDIS_HOST is required}"
: "${SPRING_DATA_REDIS_PORT:?SPRING_DATA_REDIS_PORT is required}"

export SERVER_PORT="${SERVER_PORT:-8003}"

api_pid=""
nginx_pid=""

stop_processes() {
  trap - INT TERM

  if [[ -n "${nginx_pid}" ]] && kill -0 "${nginx_pid}" 2>/dev/null; then
    kill -QUIT "${nginx_pid}" 2>/dev/null || true
  fi
  if [[ -n "${api_pid}" ]] && kill -0 "${api_pid}" 2>/dev/null; then
    kill -TERM "${api_pid}" 2>/dev/null || true
  fi

  [[ -z "${nginx_pid}" ]] || wait "${nginx_pid}" 2>/dev/null || true
  [[ -z "${api_pid}" ]] || wait "${api_pid}" 2>/dev/null || true
}

trap 'stop_processes; exit 143' INT TERM

# Spring reads datasource and Redis settings directly from the environment. Keeping
# credentials out of command-line arguments prevents them appearing in process lists.
java -jar /app/xiaozhi-esp32-api.jar &
api_pid=$!

nginx -g 'daemon off;' &
nginx_pid=$!

set +e
wait -n "${api_pid}" "${nginx_pid}"
status=$?
set -e

stop_processes
exit "${status}"
