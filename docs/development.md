# Development

## Quick start

Use Node.js 24 or newer and Python 3. There is no build step or runtime package.
Python serves the static files locally; it is not an application backend.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium webkit firefox
npm run preview
```

Open `http://127.0.0.1:18123`. Browser storage and offline installation belong to
that origin, independently of the public website. Service workers require HTTPS
or localhost. Serve `public/` at the origin root; asset and worker paths are absolute.

## Making changes

```bash
npm run format
npm run check
npm test
```

Prettier keeps source and documentation readable. Tests use Node's built-in runner
for pure rules and the worker, then Playwright for Chromium, mobile WebKit and
Firefox. Playwright starts its own loopback preview when needed. To run only one
layer, use `npm run test:unit` or `npm run test:browser`.

The browser suite covers all twenty positions, input handover and cancellation,
localization, storage failures and cross-tab updates, first-paint restoration,
failed initialization, dialogs, responsive layout, offline reload and automated
WCAG A/AA checks. Engine-specific native touch tests are explicitly skipped where
the necessary browser APIs are unavailable. Emulation does not exercise a native
Telegram/ChatGPT sheet, physical haptics or home-screen installation on an iPhone.
Unit coverage measures the model, catalog and worker; it is not whole-app coverage.

## Module boundaries

- `public/model.js` exports state defaults/validation, scale constants, position
  geometry and accent interpolation. It has no DOM, storage or network effects.
- `public/translations.js` exports the EN/DE/RU catalog. English HTML fallbacks
  must match; tests check keys, types and fallback text.
- `public/app.js` owns the DOM, input gestures, dialogs, optional haptics and
  localStorage. A remote storage update releases old pointer ownership before
  rendering the new state.
- `public/boot.js` hides unsaved defaults before paint. After initialization the
  app reveals itself; a failed module load or initialization shows a retry view.
- `public/sw.js` owns only the offline static shell. Include new assets in `SHELL`
  and increment its cache version whenever a cached file changes.

Keep the storage key and version compatible unless a migration is deliberately
introduced. Malformed or inaccessible storage must leave the app usable. Optional
vibration, offline installation and embedded-browser bridges must fail harmlessly.

## App icons

Edit `public/icons/icon.svg`, then run `npm run icons` to export the opaque
180px iPhone, 192px and 512px install icons. This uses the existing Playwright
Chromium installation. Keep the silhouette inside the centered 80%-diameter
circle so it survives platform masks. When the artwork changes, increment the
icon discovery URL revision in HTML/manifest and the worker shell cache version.

For hosting validation and release procedures, see [operations](deployment.md).
