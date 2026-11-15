# Emotional Damage

## Purpose and scope

A one-screen reflection fidget at `https://stress.valeriizhyla.com`. The user
authorized public access and a card on the personal homepage. Four zones, each
with five positions: Okay, Tired, Overloaded, Exhausted. English, German, Russian.
Show the header Back link only for an exact HTTPS main-domain referrer, and never
for an installed/standalone launch. Keep direct visits self-contained and avoid
sticky navigation flags. Settings ends with a local GitHub icon linking to the
public repository in a separate tab, with a localized accessible name.
Keep the tone personal and descriptive; this is not a diagnostic or advice tool.
Write each locale as natural, concise UI copy rather than a literal translation.
Use informal singular address in German and Russian, gender-neutral Russian
phrasing, and standard names for controls. Installation hints must identify the
platform/browser and use its documented menu labels. Keep English HTML fallbacks
in sync with translations; see decision 0005 for the copy conventions and sources.

## Structure

- `public/`: buildless, dependency-free browser app. Blocking `boot.js` marks the
  startup phase before styles/body paint; `app.js` restores and reveals the UI.
  It owns gauge input, dialogs and browser-local persistence.
  `model.js` owns pure state validation, scale geometry and colour rules;
  `translations.js` owns the EN/DE/RU catalog. `boot.js` shows a localized retry
  view if module loading or initialization fails.
- `public/sw.js`: offline shell only. Bump its cache version whenever cached
  assets change. Never cache unrelated paths or user data. Network/HTTP errors
  and a two-second network deadline may use an existing cached response; without
  cache, allow a slow first request to finish.
- `assets/heart-gauge.png`: the approved master image, outside public hosting.
  `public/icons/` contains its PNG favicon and install exports. `npm run icons`
  preserves that artwork using the existing development browser. Standard icons
  retain its composition; the separate maskable export keeps the emblem inside
  the centered 80%-diameter safe circle. Revision discovery URLs and shell cache
  when artwork changes. See decision 0014.
- `Caddyfile`: static server on 8080 and loopback readiness on 8081. No admin API.
- `compose.yaml`: pinned image, read-only unprivileged server, external `proxy`
  network alias `emotional-damage`, no host ports, health and resource limits.
- `scripts/`: validation, repeatable deployment and public verification.
- `tests/`, `playwright.config.js`: Node unit tests and Chromium, mobile WebKit
  and Firefox functional checks. Prettier enforces readable source formatting.
- `.github/workflows/checks.yml`: browser tests and deployment config validation.
- `docs/`: indexed decisions, operating procedures and dated verification.

## Invariants

- No backend, accounts, analytics, remote fonts, CDNs or server-side user data.
  `localStorage['emotional-damage.v1']` holds the last position and preferences.
- Haptic feedback is removed on every platform. Do not call vibration APIs or
  show a haptics setting. Existing v1 records may contain the retired preference;
  ignore it while preserving position/language and omit it on future saves.
- Support touch, pointer, keyboard and native slider accessibility. Good at the
  top; exhausted at the bottom. Keep 20 steps with five inside each zone.
- Keep the slider's visible focus ring for keyboard input. Pointer interactions
  anywhere on the page hide that ring without blurring or disabling the slider;
  keyboard navigation restores it. Other controls keep native focus styling.
- Match the personal website's dark surfaces, thin gray borders and system
  typography. Keep the base canvas and browser theme fixed at #101010 at every
  stress level, including with a light OS preference. The accepted ambient glow
  shares the handle's position and accent, with a lightly tinted handle face,
  colored active label/dot and quieter inactive endpoint illustrations. Retain the
  broad mobile glow; desktop uses a smaller, quieter feathered light. Blend warm
  tones gradually into red through Overloaded; all Exhausted ticks stay red.
  During dragging, interpolate the accent continuously while saved values stay
  discrete. Preserve the colored italic question. See decision 0010.
  No autonomous animation; keep contrast,
  reduced-motion and forced-colors support, and contain decorative overflow.
- During dragging, follow the latest pointer position once per display frame
  without position easing; preserve the initial contact offset on the handle.
  Keep saved/accessibility values discrete, and settle visually onto a tick on
  release/cancellation. Cancel pending frames when a gesture ends. Finish before
  keyboard/native input, zone selection, modal opening or page interruption.
  Release without saving old coordinates when another tab replaces/removes state.
- Protect the whole instrument, including endpoint drawings and surrounding blank
  space, against touch panning from touchstart. Blank space can begin a captured
  slider drag; a 24px margin around the handle preserves the initial grab offset.
  Level buttons retain native taps, while swipes over them are consumed. Keep
  dialogs and touches outside the instrument native. The optional Telegram browser
  gesture-cancellation bridge must tolerate absence or failure; do not load its SDK
  or treat this ordinary website as a Mini App. See decisions 0006 and 0008 for
  scope and host limitations.
- Mobile uses the available viewport height for a larger gauge. At widths of
  900px and heights above 570px, use a wide two-column desktop layout; short
  landscape screens have a compact two-column layout from 600px width.
- Info and Settings are centered native dialogs with content-driven heights.
  Fit normal phone browser heights in all locales; keep overflow available for short screens or enlarged text rather than clipping
  content. Focus the heading on opening and preserve keyboard control outlines,
  Escape and focus restoration. See decision 0007 for the compact dialog layout.
- Save on movement; tolerate blocked storage and malformed stored values. Keep
  manual language preference, with browser language used only as the default.
- First reveal must already match restored position, accent, selected level and
  locale. Suppress transitions during startup and flush restored layout before
  revealing the app; keep normal movement transitions afterward. Cache boot.js
  with the offline shell. Without JavaScript, retain the static/noscript fallback.
  See decisions 0009 and 0011; failed initialization must offer Retry and preserve the same conditional Back link.
- Preserve administrator access and other applications. The shared ingress in
  `../personal-infra/` owns TLS and the homepage. Read its `AGENTS.md` before edits.
- No persistent server volume is needed: state belongs to each browser/device.
  Clearing website data loses that state; never claim cross-device synchronization.
- Keep README brief. Procedures belong in `docs/`; decisions use the next unused
  four-digit filename and are listed in `docs/index.md`.

## Workflow

After repository initialization, use branches and PRs into main. Perform a focused
review of the diff and directly affected behavior; record scope, exact reviewed
head, checks and any reused evidence on the PR. Resolve blockers and pass CI
before merging/deploying. Review with the current subscription-authenticated
agent; no separate reviewer or AI API job unless requested.

Run `npm ci`, `npm run check`, `npm test` (Node unit tests and all three browser engines), and
`sudo ./scripts/validate.sh` for relevant changes. Validate before deployment;
verify real HTTPS, functionality, persistence and existing infra health afterward.
Use `scripts/deploy.sh` so Caddyfile changes trigger recreation through its config
checksum label. Source files are mounted; edits in a live checkout are immediate.
