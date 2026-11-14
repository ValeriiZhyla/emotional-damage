# 0004: Ambient stress feedback

- Status: Accepted
- Date: 2026-11-14
- Amends: [0003: Dark minimal theme](0003-dark-minimal-theme.md)

## Context

The user wants the gauge to control the page's mood without adding details or
controls. They approved an interactive proposal with a broad moving glow, a
tinted handle, colored active label and quieter inactive marks.

## Decision

Keep the #101010 base canvas, browser theme, palette, rainbow rail, typography
and responsive compositions. Add a decorative CSS light behind the gauge that
shares the existing `--position` and `--accent`. Match the proposal's 24% central
color fading to transparent, expanding its area on desktop. Contain its paint
at the viewport so it never creates page overflow or intercepts input.

Tint the handle's charcoal face with 12% accent. Color the selected level's title
and dot with the same accent as the question and handle outline. Dim inactive
endpoint illustrations to 28%; show the heart or skull at 95% in its own zone.

Use the existing direct dragging and discrete saved values without new script or
state. The light shares the handle's brief settling transition, with no easing
during dragging and no idle animation. Reduced-motion preferences remove easing;
forced-colors mode hides the light, retains the system-color handle and restores
endpoint opacity. Retain a neutral handle fallback without color-mix support.

Advance the offline shell to v7. No backend, dependencies, controls, translations,
localStorage schema, hosting or browser-chrome changes.

## Consequences

More of the page reflects the selected state while its dark foundation and
simple interaction remain. CSS alone implements the visual treatment. The
previous decision's ambient-light proposal is accepted; a separate edge tint
is not added. Broad decorative paint requires viewport and contrast checks;
native dialogs must remain visible and scrollable above the contained content.
