# Verification

## 2026-11-13: Initial release

- Compose and pinned Caddy configuration validated in an isolated container.
- JavaScript syntax, Python verifier syntax, shell syntax and documentation links
  checked. Frontend assets total approximately 76 KiB, with no runtime packages.
- Browser suite against the real Caddy static server/CSP: 31 passed, one desktop
  touch test intentionally skipped. Both Chromium and mobile WebKit were used.
- Covered all twenty pointer positions, dragging/clamping, touch, keyboard,
  English/German/Russian, browser-language defaults and explicit preference,
  reload/new-tab persistence, cross-tab updates, malformed/blocked storage,
  disabled/throwing vibration, haptic preference, offline reload and dialog focus.
- All three languages fit 320×568, 375×812, 440×956, 768×1024, 1440×900 and
  956×440 viewports without page scrolling.
- Automated WCAG A/AA checks pass at the two gauge extremes and in both sheets.
  English and Russian screenshots inspected; browser console had no errors.
- No physical iPhone was available. Mobile WebKit is automated coverage; actual
  device vibration and home-screen installation remain device-side checks.

Public HTTPS, readiness, resource use and repeat-deployment results are recorded
on the release PR after publication.

## 2026-11-13: Dragging and responsive layout revision

- Reproduced approximately 91 px of handle lag after one display frame during a
  rapid pointer movement. With continuous tracking, the same check measured
  approximately zero pixels; targeted quick-reversal tests require <1.5 px.
- At 440×956, the mobile gauge grew from approximately 411 px to 554 px tall,
  and its handle from 90×48 to 100×54 px. At 1440×900, the app grows from a 480 px
  column to a 1200 px composition with introduction and gauge in separate columns.
- Inspected mobile, desktop English and desktop Russian screenshots. Added
  regression checks for quick reversals, off-center grabs, pending-frame release,
  native touch swipes/cancellation and responsive layout geometry.
- Retained coverage for all twenty positions, localization, browser storage,
  offline use, keyboard accessibility, reduced motion and WCAG checks. The
  twenty-position test now drags through the ticks, matching the preserved
  contact point when grabbing the handle.
- Expanded three-language viewport coverage to 1024×768, 1280×720 and 1920×1080,
  alongside the original phone/tablet/landscape sizes.
- Offline shell is v2; localStorage remains `emotional-damage.v1` with the same
  schema. Prepared an existing v1 browser profile for post-publication update
  verification. Physical iPhone testing remains unavailable.

Final CI and post-publication verification are recorded on the revision PR.

## 2026-11-13: Mobile illustration clearance

Reserve 40 px between the gauge and each end illustration on phone widths,
including short viewports. This accommodates the handle and keyboard focus ring
at both extremes. Desktop and tablet spacing is unchanged. The rail gives up a
little height to preserve this clearance; its mobile size check reflects that.
Offline shell advances to v3 without changing saved state. Browser geometry,
screenshots, CI and publication results are recorded on the fix PR.

## 2026-11-13: Dark minimal theme

- Matched the personal homepage's dark palette, thin borders, system headings
  and neutral controls, retaining the colored italic question emphasis.
- Focused Chromium and mobile WebKit checks passed for offline reload, all three
  languages across nine viewport sizes, responsive geometry, and automated WCAG
  checks at both gauge extremes and in both dialogs (eight checks total).
- The page, browser theme and manifest use #101010. A browser probe checks all
  twenty positions with a light OS preference: only the existing accent changes.
  Mobile/desktop main screens and dialogs are inspected as screenshots.
- Home-screen PNG icons are rasterized from the local SVG. Offline shell v4
  retains the existing localStorage key and schema. No server settings change.
- Physical iPhone testing remains unavailable. Final CI and public deployment,
  readiness, browser persistence and resource observations are recorded on the
  theme PR.

## 2026-11-13: Stress-colored handle outline

- The handle's 1 px border shares the question's existing accent. Browser probes
  in Chromium and mobile WebKit confirm matching colors at all twenty positions,
  a fixed dark canvas/browser theme, and the retained white keyboard focus ring.
  Chromium's forced-colors mode retains the system-color 2 px border.
- Six focused checks pass in both engines: twenty-position dragging/persistence,
  rapid direction changes, and WCAG A/AA checks at both extremes and in dialogs.
  Green mobile and red desktop screenshots were inspected. Syntax, documentation
  links and Compose/Caddy configuration validation also pass.
- Offline shell advances to v5. A public WebKit profile from v4 is prepared with
  a saved position, German and disabled haptics to check retention after release.
  Final CI, public verification and health/resource results are recorded on the
  outline PR. Physical-device testing remains unavailable.

## 2026-11-13: Exhausted accents use red throughout the zone

- The first four Exhausted positions previously mixed orange into the accent.
  Positions 15–19 now stay red, deepening toward the bottom, and the static
  exhausted dot/info marker/skull share #ff4d5a.
- Chromium and mobile WebKit probes compare all twenty positions against the
  prior public version: the first fifteen accents and the whole gauge rail are
  unchanged. The word and handle still match, with a fixed dark canvas/browser
  theme. First/middle/last Exhausted screenshots were captured; mobile middle
  and desktop bottom screenshots were inspected.
- Four focused checks pass for twenty-position dragging/persistence and WCAG
  A/AA at the gauge extremes and in both dialogs. The new red colors measure at
  least 5.85:1 contrast against the canvas and 4.78:1 against the handle.
- Syntax, documentation links and Compose/Caddy validation pass. Offline shell
  advances to v6 without changing the localStorage schema. Final CI, public
  persistence/offline verification and health/resource observations are recorded
  on the color-fix PR. Physical-device testing remains unavailable.
