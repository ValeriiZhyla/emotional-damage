# Refined glow and colour progression

Status: Accepted

Date: 2026-11-14

Amends: [0004: Ambient stress feedback](0004-ambient-stress-feedback.md)

## Context

The user likes the mobile glow but finds the desktop field too large and its
concentric shape too visible. They also report an abrupt transition into red
and prefer a conventional gear for Settings. The palette previously held orange
until position 14, then changed the green channel by 51 at position 15.

## Decision

Keep the mobile light's size, intensity and gradient. At the existing desktop
two-column breakpoint (900px wide, taller than 570px), cap the light at 760×720px,
reduce its central tint from 24% to 14%, feather it through more opacity stops
and apply 28px blur. It continues to share the handle's position; no idle motion,
extra decorative layers or controls. Keep compact phone landscape unchanged.
CSS [radial gradients](https://drafts.csswg.org/css-images-3/#radial-gradients)
and [blur](https://www.w3.org/TR/filter-effects-1/#funcdef-filter-blur) provide
the desktop falloff without a raster asset or dependency.

Remove the position-14 orange anchor so positions 9–15 blend from warm amber
through coral to the existing first red at 15. Retain both endpoints and every
Exhausted tick's red. No adjacent saved tick changes an RGB channel by more than
14. During dragging, interpolate the visual accent at the fractional position,
alongside the existing continuous handle movement. Saved and accessible values
remain twenty discrete ticks; on release, restore the tick's matching accent.
The question, handle outline/tint, active label/dot and glow share one accent.

Replace the Settings sliders illustration with a small inline six-tooth gear,
using the existing stroke style, accessible button label, target size and dialog.
Remove its unused cutout style. Advance the offline shell to v13. Keep state
schema, startup restoration, text, hosting and the gauge rail unchanged.

## Consequences

Desktop retains a stress-coloured atmosphere concentrated around the gauge.
Mobile retains its accepted light treatment. The warm-to-red boundary follows
the same gradual visual progression as the rest of the scale, while Exhausted
still has a recognizably red accent. Browser checks cover colour continuity,
fractional movement, matching accents, persistence, startup, interaction and
accessibility. Visual comparison covers desktop/wide screens and mobile;
physical displays and screenshot compression can still affect gradient banding.
