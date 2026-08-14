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

echo "source-deploy rollback regression test passed"
