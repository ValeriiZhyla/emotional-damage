# Development

## Preview

Follow [Run locally](../README.md#run-locally) for a Python-only preview. From the
repository root, `npm run preview` is a convenience wrapper for the same server
if Node.js is already installed. Neither preview command needs npm packages.

Open `http://127.0.0.1:18123`, rather than opening `index.html` as a file. Browser
storage belongs to that origin, separately from the public site. Changing the
hostname or port creates a separate saved position and language.

## Set up the development tools

Use Node.js 24 or newer and Python 3. From the repository root:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium webkit firefox
```

The npm packages and browser downloads are for checks and icon generation, not
for serving the app. On Linux, `--with-deps` may need administrator access to
install browser system dependencies. Repeat the browser install after updating
Playwright so its browser binaries match the locked package version.

## Check changes

```bash
npm run check
npm test
```

`npm run check` checks formatting and JavaScript syntax. Use `npm run format` to
rewrite formatting after editing. `npm test` runs Node unit tests followed by
Playwright in Chromium, mobile WebKit and Firefox. Run one layer with
`npm run test:unit` or `npm run test:browser`.

Playwright starts and stops a loopback preview. Outside CI, it can reuse a server
already listening on port 18123: stop a preview from another checkout before
running tests. Set `APP_URL` to use an explicit origin instead of starting one;
see [deployed verification](deployment.md#verification).

The browser suite covers twenty positions, input handover/cancellation,
localization, storage failures and cross-tab updates, saved appearance on first
paint, startup failures, dialogs, responsive layout, offline reload and automated
WCAG A/AA checks. Engine-specific touch cases are skipped where the necessary
APIs are unavailable. Mobile WebKit emulation does not reproduce an iPhone’s
home-screen installation or Telegram/ChatGPT’s native browser sheets.
Unit coverage measures the model, catalog and worker; it is not whole-app coverage.

## Editing the app

See [AGENTS.md](../AGENTS.md) for the file map, responsibilities and implementation
rules. Keep English HTML fallback text in sync with the EN/DE/RU catalog.

Keep the storage key and version compatible unless deliberately introducing a
migration. Old v1 records may contain a retired haptic preference; ignore it and
omit it on subsequent saves. Malformed or inaccessible storage must leave the
gauge usable.

Whenever a file in `public/sw.js`’s `SHELL` list changes, increment `CACHE`.
Include new offline assets in `SHELL`. Documentation and its images are outside
`public/` and need no shell revision or server restart.

## App icons and README images

`assets/heart-gauge.png` is the approved oil-painted master. After installing the
tools above, run `npm run icons` to derive the 64px favicon, 180px iPhone icon,
192px/512px install icons and separate padded 512px maskable icon. Keep the
approved source intact; the maskable export fits the centered 80%-diameter safe
circle. After an artwork change, revise icon discovery URLs in HTML/manifest
and the shell cache. The master is outside public hosting and precaching.

README screenshots use sample state and no focused control: `docs/images/preview.png`
is the English desktop layout at 1280×800, position 7 (Tired); `docs/images/mobile.png`
is the English mobile WebKit layout at 440×956, position 2 (Okay). The mobile
capture is browser emulation, not a physical iPhone screenshot. Refresh both when
the visible app changes; neither is a runtime asset.
