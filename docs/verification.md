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
