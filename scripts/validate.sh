#!/usr/bin/env bash
set -euo pipefail
APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$APP_ROOT"
docker compose config --quiet
docker run --rm --network none --user 65532:65532 --read-only --tmpfs /tmp:size=8m \
  -v "$APP_ROOT/Caddyfile:/etc/caddy/Caddyfile:ro" \
  -v "$APP_ROOT/public:/srv:ro" \
  "$(docker compose config --images)" \
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
