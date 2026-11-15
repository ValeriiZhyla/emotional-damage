# Public repository readiness

Status: Accepted

Date: 2026-11-15

## Context

The owner wants to publish the repository under MIT, with readable code, clear
interfaces and fault tolerance appropriate to a small static application. Review
found an invisible UI after failed module initialization, missing cached fallback
for HTTP errors/stalled requests, and old pointer gestures overwriting newer
keyboard or cross-tab choices.

## Decision

Keep the app buildless, without a framework or runtime packages. Extract only the
pure state/scale/colour rules and the translation catalog from the DOM module.
Use Prettier for readable source and add Node unit tests plus Firefox to the
existing browser matrix. Pin CI actions by commit, grant read-only repository
permissions and avoid persisting checkout credentials.

Extend [0009](0009-restore-appearance-before-first-reveal.md): if startup has not
completed when window load fires, show a localized retry view and disable unusable
controls. A normal first reveal still starts at the saved state without animation.

Keep network-first shell requests, but use an existing cached response on network
failure, HTTP errors or a two-second network deadline. Without a cached copy,
allow a slow request to finish. Cache access errors must not discard valid network
responses. Installation still precaches the complete shell before activation;
worker updates do not force-reload open clients or change localStorage.

Give gestures explicit ownership: finish pending movement before keyboard/native
input, zone selection, a modal or page interruption. Release without committing
old coordinates when another tab replaces or removes saved state.

Add the MIT license chosen by the owner. Audit all Git refs, existing PR content
and Actions logs for credentials before making the repository public. Record the
scope, findings and validation in the [review report](reviews/2026-11-15-public-readiness.md).

## Consequences

There are two small extra browser modules, both included in offline precaching.
There is no bundler, general controller framework or state dependency. Development
adds one formatter and a third test engine; production still has no runtime npm
packages. Storage schema, normal visuals, hosting topology and data ownership
remain compatible. Failed initialization now offers recovery rather than a blank
screen, and cached visits tolerate server errors and stalled connections.
