# Self-hosting and operations

## Host your own copy

Serve the contents of `public/` with any static host at the root of a dedicated
HTTPS origin, such as `https://gauge.example.com/`. No backend, database, Node.js
process or Docker deployment is required for static hosting.

- Publish only `public/`, not the whole repository. The icon master, documentation
  and deployment files are not web assets.
- Use the origin root. Absolute module, manifest and worker paths do not support
  a subdirectory such as `example.com/emotional-damage/` without code changes.
- Serve JavaScript, CSS, PNG and manifest files with their correct content types.
  Keep `/sw.js` available at the root and allow it to register a service worker.
- Use HTTPS for offline/install support, except for loopback development. The
  browser must also permit service workers and cache storage.
- Retain the security and cache headers in [Caddyfile](../Caddyfile), or their
  equivalents on your host. Allow same-origin scripts, styles, images, manifest,
  worker and connections; no third-party runtime assets are needed. Revalidate
  shell assets instead of giving stable filenames an immutable cache lifetime.

For a fork, update the canonical URL and desired Home/repository links in
`public/index.html`, and the trusted Home origin in `public/boot.js`. Back appears
only for that exact origin, excluding installed launches. The current companion
homepage card explicitly shares an origin-only referrer; a new companion site
with `no-referrer` needs the same per-link override. Otherwise Back stays hidden.
Manifest identity, scope and start URL are relative to the new host’s root.

Moving to a different domain, protocol or port does not move browser-local data.
Test your own origin online, then reload offline and check that a position and
language change survive. See the update lifecycle below.

## Personal VM integration

The bundled Compose configuration is the project’s existing deployment, not a
standalone public web server. It requires Docker Engine with the Compose plugin
and an HTTPS ingress on the external `proxy` network. It publishes no host ports.
The deployment script creates that network if it is missing; the ingress itself
is managed separately by `../personal-infra/`.

Live checkout: `/home/agent/infra/apps/emotional-damage`. Compose project:
`emotional-damage`; service: `web`; upstream: `emotional-damage:8080`. There are no
server data volumes; the adjacent ingress owns TLS and its certificate volumes.

Validate and review changes in a separate checkout first: the live checkout’s
static files are bind-mounted, so changing them publishes immediately. After the
reviewed PR and checks pass, update the managed checkout and run:

```bash
sudo ./scripts/validate.sh
sudo ./scripts/deploy.sh
sudo docker compose ps
python3 scripts/verify.py
```

The script validates, starts the service and waits for readiness. Its Caddyfile
checksum label recreates the container only when configuration changes. Repeating
deployment with unchanged sources keeps the same healthy container. Use the
script after Caddyfile changes rather than raw `docker compose up`. Documentation-only
changes need no deployment command, server restart or shell cache bump.

Readiness is container-local `127.0.0.1:8081/healthz`. The listener and admin API
are not public; the app’s public `/healthz` returns 404. Limits are 64 MiB memory,
0.25 CPU, 64 processes, 8 MiB tmpfs and logs rotating at 2 × 5 MiB. Caddy runs as
UID/GID 65532 with a read-only filesystem and all capabilities dropped. Its admin
API and automatic HTTPS are disabled because the shared ingress owns TLS.

## Verification

[Development](development.md) describes requirements and local checks. CI also
validates Compose and the isolated Caddyfile. Production has no self-hosted CI
runner or automatic deployment for this app.

`scripts/verify.py` is deliberately specific to `https://stress.valeriizhyla.com`:
it checks real TLS, redirect behavior, security headers, assets, manifest, private
readiness and missing paths. It does not verify a different host merely because
you run it from that host’s checkout. Adapt its origin and expected deployment
contract for a different installation.

To run browser checks against an explicit deployment:

```bash
APP_URL=https://stress.valeriizhyla.com npm run test:browser
```

`APP_URL` suppresses Playwright’s local server. Tests use synthetic browser-local
data, including offline and storage-failure cases, without sending selections to
a backend. Automated WebKit coverage does not replace an actual iPhone install
or native in-app browser check. Dated results are in [verification](verification.md).

## Offline updates, persistence and rollback

A first online visit must finish downloading the complete shell before offline
use is available. Registration/download failure leaves the online gauge usable.
New workers install in the background when online and activate after old app
clients close. They remove only caches with this app’s prefix and keep saved
position/language. Close old app tabs/windows and reopen online to allow a waiting
update to activate; clearing site data is not needed.

The active worker tries the network for known shell requests. It uses a cached
response on network/HTTP errors or a two-second deadline. Without a cached copy,
a slow first request continues. Browser restrictions, private browsing or storage
eviction can prevent or remove the offline copy.

State key: `emotional-damage.v1`; schema: `{ version: 1, value: 0..19,
language: 'en'|'de'|'ru' }`. Older v1 records can contain a retired `haptics` field,
ignored on read and omitted on the next save. There is no server-side user data
or cross-device sync. Clearing site data removes saved state; blocked or malformed
storage leaves the gauge usable.

To roll back, validate a previously reviewed revision in an isolated checkout,
then restore that revision to the managed checkout and rerun deployment. Browser
storage stays, but offline clients may retain their previous shell until online.
Never remove personal-infra’s certificate volumes or unrelated application data.
