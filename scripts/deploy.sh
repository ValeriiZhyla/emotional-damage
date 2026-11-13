#!/usr/bin/env bash
set -euo pipefail
APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$APP_ROOT"
"$APP_ROOT/scripts/validate.sh"
if ! docker network inspect proxy >/dev/null 2>&1; then docker network create proxy >/dev/null; fi
# A changed bind-mounted Caddyfile recreates the container; unchanged deployments
# leave it running. No admin API is needed inside the static server.
APP_CONFIG_SHA="$(sha256sum Caddyfile | cut -d ' ' -f1)"
export APP_CONFIG_SHA
docker compose up -d --wait --wait-timeout 60
