# Approved heart gauge icon

Status: Superseded by [0014 — Oil-painted heart gauge icon](0014-oil-painted-heart-gauge-icon.md)

Date: 2026-11-15

Supersedes: [0012 — Soft heart app icon](0012-soft-heart-app-icon.md)

## Context

The owner preferred a heart containing four stress bands and a single gauge
needle over the initial solid heart. After reviewing generated previews, they
selected the original taller proportions with only the upper notch and bottom
tip gently rounded, and explicitly requested deployment.

## Decision

Use the exact approved image, preserved as `assets/heart-gauge.png`. It was
created with the built-in imagegen tool; the selected edit retained the original
proportions, colours, stroke thickness, four bands and needle, and rounded only
the sharp vertices. Keep that approved source outside the public/offline shell.

`npm run icons` derives an opaque 64px PNG favicon, 180px Apple touch icon,
192px/512px general install icons and a separate 512px maskable icon. Standard
exports retain the approved composition. The maskable export adds padding so the
whole emblem fits inside the centered 80%-diameter safe circle. Use PNG discovery
rather than substituting a redrawn SVG for the selected artwork.

Advance discovery URLs to revision 3 and the offline shell to v16. Include both
new public PNG paths in precaching and public verification, remove the retired
SVG, and keep manifest identity and browser-local state compatible.

## Consequences

The installed image matches the approved concept, with reproducible exports and
no runtime dependency. Raster exports are larger than the former simple vector;
the 1.5MB master remains outside public hosting and is not precached. New installs
use the updated artwork; existing home-screen icons are refreshed by the OS and
may retain the image selected at installation. No app behavior or data migration
is required.
