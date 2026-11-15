# Public-readiness review — 2026-11-15

Scope: the complete static app, state and localization contracts, input lifecycle,
startup and offline behavior, accessibility/responsive regression suite, repository
structure, deployment configuration, dependencies and existing publication history.
The review uses the current authenticated agent; no independent reviewer is claimed.

## Findings resolved

| Priority    | Finding and trigger                                                                                                              | Resolution                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High        | A failed app module/import or initialization left the startup marker set and the entire UI invisible.                            | Boot now reveals a localized error and Retry, disables unusable controls and keeps Back usable. Failed-load and failed-initialization browser tests check recovery and saved-state retention. |
| Medium      | The offline worker fell back only when fetch rejected: HTTP 404/500/503 and stalled connections bypassed the valid cached shell. | Known shell requests use cache on HTTP/network errors or a two-second deadline. Without cache, slow first requests continue; cache API failure does not break valid network responses.        |
| Medium      | Releasing an old drag could overwrite a later keyboard/native input or a change/removal from another tab.                        | Explicit gesture cleanup hands ownership to the new input. Modal/page interruptions also finish pending movement; remote changes release it without saving old coordinates.                   |
| Maintenance | Locale strings, pure rules and UI effects shared one file, and compressed layout source obscured review.                         | Separate small model/catalog modules, readable formatting, documented boundaries and formatter checks. No runtime dependency, build system or generalized state framework.                    |
| Publication | No license and limited fault-path/engine coverage.                                                                               | Owner-selected MIT license, focused unit/failure tests, Firefox coverage and pinned CI actions with read-only permissions.                                                                    |

## Validation and audit

- Model tests cover all 120 valid position/language/haptics combinations, malformed
  JSON, invalid field types, unknown versions/fields, independent defaults,
  geometry and continuous colour interpolation. Catalog tests check locale keys,
  nonempty values and English HTML fallbacks.
- Worker tests exercise complete precaching, failed installation, scoped cleanup,
  successful network responses, HTTP/network errors, deadlines, absent/broken
  cache and excluded requests. Coverage is reported for these pure modules and
  the actual worker source, not for the whole browser application. This scoped
  unit run reports 100% line/function coverage and 98.28% branch coverage.
- The browser matrix covers Chromium, mobile WebKit and Firefox, including all
  prior gesture, saved-first-paint, responsive, localization, offline and WCAG
  checks. New tests reproduce each startup/input failure and verify recovery.
- Real-browser fault-server probes in all three engines preserve a saved Russian
  selection through HTTP 503 responses and 15-second stalled shell responses.
  Cached reloads finish in roughly 6.2–6.5 seconds under the stalled-network probe
  (the two-second deadline applies per request, including imported modules).
  Before/after page screenshots have identical pixels at 440×956 and 1440×900
  for green, coral and red saved values.
- Gitleaks 8.30.1 (official binary with verified release checksum) detected no
  credentials in all Git refs or exported existing PR/issue comments and all 27
  existing Actions log archives. The initial audit included 28 commits and 13
  PRs; the final release adds a scan of the review changes and new CI logs.
  Repository Actions secrets, variables and stored artifacts were empty.
- The npm dependency audit reports no known vulnerabilities. All npm packages
  are development-only. Container configuration retains its pinned static-server
  image, unprivileged user, read-only filesystem, dropped capabilities, private
  readiness listener, restart policy and memory/CPU/process/log limits.
- No state migration, backend, new public port, ingress change, unrelated data
  removal or credentials are required.

The exact reviewed commit, final check counts, public deployment, old-profile
retention, readiness and resource observations are recorded on the release PR.

## Limits

Credential scanning and automated tests do not prove the absence of every defect.
Physical iPhone haptics, Safari installation and native Telegram/ChatGPT overlay
behavior remain device checks. Browser automation exercises web event handling;
it cannot reproduce those native host sheets. Hosting currently expects the
origin root, as documented in development. No blocker remains in the reviewed
scope once the release PR's checks pass.
