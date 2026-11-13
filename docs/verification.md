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
