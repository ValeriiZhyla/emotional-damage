# Soft heart app icon

Status: Superseded by [0013](0013-approved-heart-gauge-icon.md)

Date: 2026-11-15

## Context

The previous icon combined a thin gauge, handle and small heart. At home-screen
size it left too much empty space and its small details were hard to recognize.
The owner selected a single broad, slightly squashed heart with a subtle crease.

## Decision

Use one coral heart on the app's charcoal canvas. Keep its silhouette broad,
slightly asymmetric and rounded, with a quiet vertical colour shift and one
crease. Optically center it and keep the complete heart inside the centered
80%-diameter circle used as the maskable-icon safe area.

Maintain one editable SVG source and export opaque 180, 192 and 512 pixel PNGs
with `npm run icons`, using the existing development browser dependency. Use the
same artwork for the favicon, iPhone home-screen icon and web manifest icons.
Version their discovery URLs with `?v=2` to distinguish the new artwork in icon
caches. Keep stable asset paths in the offline shell: its fetch handler matches
these known static assets by pathname, including versioned discovery requests.
Advance the shell to v15; retain the manifest identity and browser-local state.

## Consequences

The icon reads as a single shape at small sizes, with substantially more visual
weight than the old gauge. No runtime package, app layout or interaction change
is needed. Raster exports can be regenerated from the vector without a separate
image toolchain. Existing home-screen installations may retain the icon chosen
at installation; the new discovery URLs are used for newly added shortcuts.
