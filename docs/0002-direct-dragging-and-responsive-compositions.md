# 0002: Direct dragging and responsive compositions

- Status: Accepted
- Date: 2026-11-13

## Context

The user likes the initial app but reports odd behavior during fast mobile
movements, wants a larger mobile gauge, and finds desktop cramped. The original
handle restarted a 160 ms position animation at every step. A rapid desktop
pointer movement reproduced about 90 px of visual lag after a display frame.

## Decision

Follow the latest pointer continuously, at most once per animation frame, without
position easing during dragging. Preserve the initial contact point when grabbing
the handle. Cache geometry at gesture start; keep the semantic/saved value snapped
to one of twenty positions and keep existing haptic boundaries. On release or
cancellation, cancel pending frames, commit the latest valid point and settle
visually onto its tick. Stop a gesture when focus or viewport geometry changes.

Use the mobile viewport more fully, shorten the introduction slightly, enlarge
the handle and increase label readability. At 900px width and above, with at least
571px height, use an introduction/footer column alongside a larger gauge column,
with larger typography and more generous spacing. Retain compact landscape and
single-column tablet/phone arrangements.

Bump the offline shell cache to v2. Keep the existing localStorage key/schema,
translations, public URL and all server/infrastructure settings unchanged.

## Consequences

The handle follows fast movements directly and retains small-position precision
when released. A tap on the handle keeps its contact point; tapping the track
elsewhere still repositions it. Larger screens get a composition using their
width rather than a narrow phone layout. Existing device-local state survives
the update. Automated checks cover tracking error, quick reversals, final-event
handling, native touch cancellation and responsive gauge/layout geometry.
