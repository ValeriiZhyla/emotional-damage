# Deployment and operations

## Personal VM

Checkout: `/home/agent/infra/apps/emotional-damage`. Independent Compose project:
`emotional-damage`; service: `web`; network alias: `emotional-damage:8080` on the
shared `proxy` network. No application host ports or data volumes. The public
ingress remains in `../personal-infra/`, with its certificate volumes intact.

```bash
sudo ./scripts/validate.sh
sudo ./scripts/deploy.sh
sudo docker compose ps
python3 scripts/verify.py
```

The deployment script validates before starting and waits for readiness. A
Caddyfile checksum label recreates the container only when configuration changes.
Static files are mounted read-only. Repeat deployment with unchanged sources
leaves the same healthy container running. Do not use raw `compose up` after
changing the Caddyfile; run the script to refresh its checksum.

Readiness is at container-loopback `127.0.0.1:8081/healthz`. Neither the listener
nor an admin API is exposed through the proxy. The main public Caddy route proxies
to port 8080 and owns HTTPS; its `/healthz` response is deliberately 404.

Limits: 64 MiB memory, 0.25 CPU, 64 processes, 8 MiB tmpfs; logs rotate at 2 × 5 MiB.
The static server runs as UID/GID 65532 with all capabilities dropped. Its Caddy
admin API and automatic HTTPS are disabled because the shared ingress owns TLS.

## Development and verification

For local requirements, commands and module boundaries, see
[development](development.md).

Preview binds only `127.0.0.1:18123`. Playwright starts/stops its own preview when
`APP_URL` is unset. `APP_URL=https://stress.valeriizhyla.com npm test` checks the
deployed app, including actual security headers being applied by browsers. The
offline test uses synthetic browser-local state and never sends it to a backend.

CI also validates Compose and the isolated Caddyfile. Production publication uses
the reviewed PR and passing checks; there is no self-hosted CI runner or automatic
deployment for this application yet. Follow the adjacent personal-infra workflow
for any routing/homepage changes.

## Offline updates, persistence and rollback

Increment `CACHE` in `public/sw.js` whenever any `SHELL` asset changes. The worker
precaches a complete app and uses the network when available, with a cached
fallback for network/HTTP errors or a two-second network deadline. Without an
existing cached copy, slow requests continue. Workers activate after old clients close; activation removes
only older caches with this app's prefix. Existing localStorage stays untouched.

State key: `emotional-damage.v1`; schema: `{ version: 1, value: 0..19,
language: 'en'|'de'|'ru', haptics: boolean }`. There is no server-side user data.
Clearing website data clears it, and private browsing may make it temporary.
Blocked or corrupted storage does not prevent gauge use.

Rollback by checking out a previous reviewed commit and rerunning deployment.
Browser storage remains; offline caches may retain an older shell until online.
Never remove personal-infra certificate volumes or unrelated application data.
