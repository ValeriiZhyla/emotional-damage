# Contextual Back and repository link

Status: Accepted

Date: 2026-11-15

## Context

The owner wants a way back when entering from the main website, without an
accidental exit to that website on direct visits or installed launches. They
also requested a GitHub icon at the end of Settings.

## Decision

Hide the header Back anchor in HTML. During DOM readiness, show it only when
`document.referrer` parses to the exact origin `https://valeriizhyla.com` and
neither the standalone display mode nor iOS standalone flag is active. Missing,
unavailable or unrecognized referrers keep it hidden. Use a normal anchor to the
main website instead of navigating arbitrary browser history. The same rule
applies if app initialization fails; without scripting the link stays hidden.

The main site's Emotional Damage card opts into `referrerpolicy="origin"` for
this one navigation. Its global `no-referrer` policy stays intact. Only the
origin is shared, never the source path or query. No query marker, storage flag,
tracking or session migration is needed. Browsers retain this entry referrer on
reload; a new direct navigation clears it.

End Settings with a local inline monochrome GitHub icon and a 44px link target
to the public repository. Give it a localized accessible name and open it in a
separate tab with `noopener noreferrer`. Keep ordinary phone dialogs centered
and unscrolled, and preserve overflow for short screens or enlarged text.

## Consequences

Direct and installed visits stay self-contained. A browser that suppresses the
referrer also suppresses Back; this is a presentation hint, not authentication.
The main-card change is deployed from the independent personal-infra repository.
The source link makes no GitHub request until clicked and adds no dependency.
The v17 shell update includes these UI changes alongside the new icon.
