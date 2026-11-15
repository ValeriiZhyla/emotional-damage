# 0001: Browser-local reflection gauge

Publication policy changed in [decision 0011](0011-public-repository-readiness.md).
Haptic feedback was removed by [decision 0016](0016-remove-haptic-feedback.md).

- Status: Accepted
- Date: 2026-11-13

## Context

A physical whiteboard scale helps its owner recognize emotional load. The user
requested a pleasant digital fidget with local persistence, three languages,
optional haptics, its own repository, and public access through personal infra.
The final brief permits four stages instead of the original three. The primary
device is a recent iPhone Pro Max; unsupported vibration should be ignored.

## Decision

Build a single-screen static app with Okay, Tired, Overloaded and Exhausted zones,
five snap positions per zone, visible dividers, heart/skull illustrations and
position-dependent color. Dragging, tapping, keyboard and a native accessible
slider all control the same position. Descriptions support recognition rather
than prescribe action. Keep the name Emotional Damage in every language.

Store only the current position, language and haptic preference in validated,
versioned localStorage. Use browser language initially, with explicit English,
German and Russian selection. Storage failures keep the app usable and show a
short saving-status note. Haptics are best-effort and respect reduced motion.

Provide an offline cached shell and home-screen manifest. Use local system fonts
and code-native illustrations; the frontend has no runtime dependencies. The
independent repository remains private, matching the existing infrastructure
repositories; the app itself is explicitly public.

Serve files with an unprivileged, read-only, pinned Caddy Compose service on the
shared proxy network, without host ports or persistent server data. Personal
infra terminates TLS at `stress.valeriizhyla.com` and links from its homepage.

## Consequences

The app needs no database, account, synchronization or server-side backup. Website
data deletion loses saved state, and separate browsers/devices retain separate
values. There is no history, reminder system, scoring or clinical interpretation.
Offline shell changes require a version bump; new workers activate naturally
after old clients close to avoid mixing application versions. Browser tests
verify interaction, localization, failure handling, persistence and offline use.
