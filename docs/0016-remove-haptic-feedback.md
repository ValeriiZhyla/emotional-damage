# Remove haptic feedback

Status: Accepted

Date: 2026-11-15

Supersedes the haptic portions of [0001](0001-browser-local-reflection-gauge.md),
[0002](0002-direct-dragging-and-responsive-compositions.md),
[0005](0005-natural-language-ui-copy.md) and
[0007](0007-centered-compact-dialogs.md).

## Context

The primary device, iPhone Safari, does not expose the vibration API used by the
app. Desktop Chrome exposes the method even without usable vibration hardware,
so the feature setting can be misleading. The owner explicitly requested removal
of both the feature and the setting on every platform.

## Decision

Remove vibration detection/calls, timing and preference handling from the app.
Remove the settings control, its styles and its English/German/Russian labels.
Keep reduced-motion support for visual transitions.

Remove the haptic field from validated state. Keep `emotional-damage.v1` and its
version so old records retain their selected position and language. Unknown
fields, including the retired preference, are ignored during parsing and omitted
on subsequent saves. Reading a record does not rewrite or clear browser storage.
No separate migration or compatibility toggle is necessary.

Advance the offline shell to v18 so existing installations receive the updated
HTML, script, styles, model and translations through the normal worker lifecycle.

## Consequences

Settings is smaller and consistent across browsers. The gauge no longer reads
or invokes vibration APIs. Existing position/language and offline use remain
compatible, including changes arriving from older tabs. No package, backend or
server-side data is added. Historical decision and verification records retain
their original evidence and link to this change.
