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

## 2026-11-14: Ambient stress feedback

- Implemented the accepted glow, handle tint, colored selected label/dot and
  dimmed inactive endpoint illustrations through CSS. The existing palette,
  rail, responsive geometry, script and saved-state schema are unchanged.
- Eight focused Chromium/WebKit checks cover rapid dragging, multilingual
  viewport fit, desktop/mobile geometry and WCAG A/AA. An initial decorative
  overflow at phone widths was resolved with viewport paint containment; the
  affected six checks pass on the final styles. The two unchanged geometry
  checks reuse their prior passing result.
- Manual probes check all twenty positions in both engines: glow/handle position,
  matching label accents, endpoint emphasis, dark base/browser theme, no overflow
  or page errors, and forced-colors fallback. Green desktop, red mobile and mobile
  info screenshots were inspected. Additional probes cover default-motion quick
  reversals/idle stillness and a short Russian dialog's scrollable footnote.
- Syntax, documentation links and Compose/Caddy validation pass. Offline shell
  advances to v7. A pre-release v6 WebKit profile with German, position 14 and
  haptics disabled is prepared for post-release retention checks. Final CI,
  public persistence/offline verification and health/resources are recorded on
  the release PR. Physical-device testing remains unavailable.

## 2026-11-14: Slider focus follows the input method

- Reproduced the sticky white handle outline in Chromium and mobile WebKit after
  pointer focus. Document-level input-method listeners now suppress only this
  ring after mouse/touch/pen use, including taps outside the slider. Keyboard
  input restores the native focus-visible treatment without blurring the slider.
- A regression test covers Tab navigation, mouse/mobile touch, outside clicks,
  keyboard resumption and value changes. It checks rendered outline style rather
  than the browser's unused default outline width. Both engines pass.
- Existing focused checks pass for keyboard values/accessibility, fast reversals,
  native touch cancellation and WCAG A/AA; one platform-specific touch check is
  intentionally skipped. Mobile pointer and desktop keyboard screenshots were
  inspected. Syntax, documentation links and Compose/Caddy validation pass.
- Offline shell advances to v8; the saved-state schema and visuals are unchanged.
  A pre-release v7 WebKit profile with Russian, value 7 and disabled haptics is
  prepared for public retention checks. Full CI, public pointer/keyboard and
  offline checks, and health/resources are recorded on the fix PR. Physical
  iPhone testing remains unavailable.

## 2026-11-14: English, German and Russian copy review

- Reviewed all 37 locale keys in each language: main-screen labels and captions,
  guidance, settings, accessible labels, storage messages and installation hints.
  Replaced literal translations and vague metaphors with concise everyday copy.
  Current iPhone/Safari action names are checked against Apple's localized guides
  linked in decision 0005. Initial English HTML and app descriptions are updated.
- The full local Chromium/mobile WebKit suite passes 42 checks with two intentional
  platform skips. Later heading/English description polish is checked by manual
  browser probes; the full suite is also required in CI on the final PR head.
- Additional probes in both engines cover all languages at 320×568, 440×956 and
  1440×900, both dialogs including supported haptic settings, 18 WCAG A/AA scans,
  language persistence, localized offline reload and blocked storage on small
  screens. English HTML fallbacks match the catalog. A long German info heading
  was shortened for narrow screens. Main screen and dialog screenshots are
  inspected; no page errors or horizontal text overflow remain.
- Offline shell advances to v9. A public v8 WebKit profile with Russian, value 18
  and haptics disabled is prepared for post-release retention verification. The
  saved-state schema, gauge behavior and styles are unchanged. Final CI, public
  verification, persistence and health/resource observations are recorded on the
  copy PR. No human native-speaker or physical-device review is claimed.

## 2026-11-14: Embedded browser gesture conflict

- The reported Telegram/iPhone overlay conflict is investigated against pinned
  Telegram iOS source (decision 0006). An active slider drag now consumes touch
  panning and uses the host's optional gesture-cancellation event. No document-wide
  lock, SDK, browser sniffing, visual change or saved-state migration is added.
- The full local run passes all 42 existing browser checks, with two intended
  platform skips. The enhanced native Chromium swipe check confirms touch moves
  are consumed and host cancellation is requested, alongside fast reversals,
  touch cancellation and zero page scrolling.
- A new cross-engine regression covers active versus inactive drags, cancelable
  versus noncancelable events, untouched dialog gestures, absent/throwing bridges
  and continued value saving. Its initial WebKit harness used a non-constructible
  Touch interface; after using DOM event propagation instead, the regression
  passes in both engines. This does not emulate Telegram's native overlay.
- Syntax, documentation links and Compose/Caddy configuration are validated.
  Offline shell advances to v10. A public v9 WebKit profile with German, value 9
  and disabled haptics is prepared for release retention checks. Final exact-head
  review, full CI, public browser/offline checks and health/resources are recorded
  on the fix PR. Physical iPhone/Telegram confirmation remains unavailable.

## 2026-11-14: Centered compact Info and Settings

- Replaced the bottom-aligned mobile sheets with centered, content-sized native
  dialogs. Titles and 44px close buttons share a row; redundant eyebrows are
  removed. Languages use a compact radio row that can wrap with enlarged text.
  Info copy is shorter in EN/DE/RU, while secondary text grows to 12px.
- The full local suite passes 48 checks with two intentional platform skips.
  New regression checks cover both dialogs in all three locales at 375×640,
  440×740 and 1440×900, including visible haptic controls: centered bounds, no
  internal scrolling, complete footnotes and one-row language choices. Header
  focus, Tab to Close, Escape, reduced motion and focus restoration also pass.
- A 320×480/doubled-text check confirms usable overflow, no horizontal clipping,
  access to the last paragraph and close control. Twelve additional WCAG A/AA
  scans pass across both dialogs, all locales and both engines at 375×640.
  Russian mobile Info/Settings and German desktop Info screenshots are inspected.
- Syntax, locale keys, English HTML fallbacks, unchanged procedural app behavior,
  documentation links and Compose/Caddy configuration are checked. Offline shell
  advances to v11. A public v10 mobile WebKit profile with Russian, position 16
  and disabled haptics is prepared for retention verification. Full CI and public
  layout/offline/persistence/health results are recorded on the PR. Physical
  iPhone/browser-chrome verification is unavailable.

## 2026-11-14: Forgiving gauge touch area

- Expanded touch protection from the narrow input to the whole instrument,
  including blank space and endpoint drawings. Default cancellation and the
  optional Telegram cancellation request begin at touchstart. Level-button taps
  remain native; swipes over them are consumed. Dialogs and the rest of the page
  keep their native gestures. Decision 0008 updates the earlier scope in 0006.
- Blank space can begin a captured range drag. A 24px margin around the handle
  preserves the initial grab offset. The full local Chromium/mobile WebKit suite
  passes 51 checks with three intentional platform skips, including near misses
  at phone/desktop sizes, resize cleanup, native mobile taps, level buttons,
  keyboard focus, persistence, offline, responsive dialogs and WCAG A/AA checks.
- An enhanced native Chromium swipe regression then passes on an artificially
  scrollable document: starting beside the input, on either drawing or on a label
  prevents page panning; a swipe starting outside the instrument actually scrolls.
  Cross-engine event tests cover early cancellation, noncancelable events,
  untouched dialogs and absent/throwing host bridges. These do not emulate native
  iPhone host sheets in Telegram or ChatGPT.
- Syntax, whitespace, documentation links and Compose/Caddy validation pass.
  Offline shell advances to v12 without a saved-state migration. A pre-release
  v11 mobile WebKit profile with Russian, position 18 and disabled haptics is
  prepared for public retention verification. Exact-head review, final full CI,
  public/offline/persistence checks and health/resources are recorded on the PR.

## 2026-11-14: Restore saved appearance before first reveal

- A same-origin blocking boot script marks startup before body/styles paint.
  The module validates saved state, renders position, accent, selected level and
  language, resolves layout with transitions disabled, then reveals the app.
  Normal interactive motion remains available; no spinner, fade or timer is added.
  Decision 0009 documents the startup contract. The v12 offline shell and public
  asset verification include boot.js.
- The full updated local suite passes 53 checks with three intentional platform
  skips. New Chromium/mobile WebKit tests delay the module response, verify that
  default UI stays hidden, then inspect the first visible animation frames across
  four red/green openings and reloads. Position, accent, level, Russian locale and
  zero startup animations match the restored state. Offline reload, malformed or
  blocked storage, gestures, responsive dialogs and accessibility also pass.
- Manual checks in both engines confirm that disabling JavaScript still shows
  the static page, noscript explanation and Back link. Syntax, whitespace,
  relative documentation links and Compose/Caddy validation pass.
- The earlier gesture PR head's CI caught a timing problem in its new test: the
  second viewport sampled handle bounds during an intentional zone-button
  transition. The test now waits for that transition to finish before measuring
  the grab offset; both focused and full local runs pass. Final exact-head review,
  CI, public startup/gesture/offline checks, old-profile retention and health are
  recorded on the combined update PR before deployment.

## 2026-11-14: Desktop light, gradual red and Settings gear

- Kept the mobile light treatment and scoped a smaller, quieter feathered glow
  to the existing desktop breakpoint. Replaced the Settings sliders with an
  inline gear using the same button, stroke and accessible labels. Decision 0010
  amends the earlier desktop glow decision; the offline shell advances to v13.
- Removed the last-orange anchor so Overloaded blends into red across five
  changed ticks (10–14). Earlier colours and all five Exhausted reds are unchanged.
  Visual colour now follows the fractional drag position while saved/accessibility
  values remain discrete. Release restores the tick's corresponding accent.
- Eight focused Chromium/mobile WebKit checks pass for colour continuity,
  within-tick response, matching question/handle/label accents, saved values,
  startup, fast reversals and automated accessibility. Eight additional WCAG A/AA
  scans pass at the new interior colours on mobile and desktop in both engines.
  Probes confirm only ticks 10–14 change, reduced-motion behavior, desktop-only
  blur and Chromium forced-colors fallback.
- Before/after screenshots cover 1440×900 green, near-boundary and bottom red,
  1920×1080 red and 440×956 mobile green/red. Mobile instrument screenshots at
  values 2 and 19 have identical PNG pixels and computed light styles. Desktop
  near-boundary/red and mobile green screenshots are inspected, including the
  new gear. No horizontal overflow occurs in these captures.
- Syntax, whitespace, documentation links and Compose/Caddy configuration are
  checked. A pre-release v12 mobile WebKit profile with German, value 14 and
  disabled haptics is prepared. Final full local/CI results, exact-head review,
  public colour/gesture/startup/offline checks, retention and health/resource
  observations are recorded on the PR before/after deployment as appropriate.

## 2026-11-15: Public repository review

- Reviewed the complete app and deployment configuration, Git history, PR content,
  Actions logs and development dependencies. Concrete findings, scope and audit
  evidence are in the [review report](reviews/2026-11-15-public-readiness.md).
- Reproduced and fixed invisible startup failures, incomplete offline fallback
  and interrupted drags overwriting newer input. Added focused regression tests,
  small pure model/catalog modules, readable formatting and Firefox coverage.
- Fourteen Node tests pass with 100% line/function and 98.28% branch coverage of
  the model, catalog and worker. Real browser fault-server probes pass in all
  three engines for HTTP 503 and stalled network responses. Six mobile/desktop
  captures at green, coral and red are pixel-identical to the previous release.
- The expanded browser run exposed a test timeout from grouping all languages
  and eighteen dialog openings together. Parameterizing by language preserves
  the checks with separate, more useful failure reports. Final full local and CI
  counts are recorded on the release PR.
- Added the owner-selected MIT license, development guide and decision 0011.
  Offline shell advances to v14, including both new modules. A public v13 WebKit
  profile with German, value 14 and disabled haptics is prepared for retention
  verification. Final publication, public checks and health/resources are recorded
  on the PR. Physical iPhone/native host testing remains unavailable.

## 2026-11-15: Soft heart app icon

- Replaced the thin gauge illustration with a broad coral heart, rounded tip and
  one quiet crease. The SVG is the source for opaque 180px iPhone, 192px and 512px
  install icons; `npm run icons` regenerates all PNGs using the existing browser
  dependency. Two exports have identical hashes. No runtime dependency is added.
- Inspected 180px home-screen, 64px shortcut, 32px favicon and round-mask previews.
  Pixel analysis places all colored artwork inside the centered 80%-diameter
  maskable safe circle (maximum radius 203.25 of the allowed 204.8 at 512px).
- Fourteen Node checks and six focused Chromium/WebKit/Firefox checks pass for
  saved-first-paint restoration and complete offline reload. Additional probes
  verify every versioned icon URL online and offline in all three engines,
  advertised PNG dimensions, opaque backgrounds and no page errors.
- Updated favicon, Apple touch icon and manifest discovery URLs to revision 2,
  while keeping the app identity stable. Shell v15 precaches the updated artwork;
  saved state and page interactions remain compatible. Decision 0012 documents
  the choice. Exact-head review, full CI and public deployment/retention/health
  evidence are recorded on the release PR. Native home-screen icon refresh is
  controlled by the device and may require adding a new shortcut.
