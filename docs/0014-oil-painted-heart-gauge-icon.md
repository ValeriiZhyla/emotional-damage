# Oil-painted heart gauge icon

Status: Accepted

Date: 2026-11-15

Supersedes: [0013 — Approved heart gauge icon](0013-approved-heart-gauge-icon.md)

## Context

The owner found the precise outline and separate gauge bands too close to a
monitoring dashboard. They wanted a warmer, crafted icon while retaining the
heart and central gauge. Of two generated previews, they selected the second,
restrained oil-painted version and explicitly requested its use on the website.

## Decision

Replace `assets/heart-gauge.png` with the exact selected oil-painted image. Keep
its terracotta heart, continuous sage-to-ochre-to-coral arc, ivory needle and
subtle painted surface intact. Do not redraw or regenerate the chosen artwork.
The master remains outside public hosting and the offline shell.

Use the existing `npm run icons` pipeline for the opaque 64px favicon, 180px
Apple touch icon, 192px/512px install icons and separate padded 512px maskable
export. Advance HTML/manifest icon discovery URLs to revision 4 and the shell
cache to v17, preserving manifest identity and browser-local state.

## Consequences

The icon has a tactile visual treatment with the same recognizable gauge
composition. Exports remain reproducible and add no runtime dependency. The
2.47MB source is kept in the repository; only the smaller platform exports are
served and cached. Existing installations receive the app-shell update through
the normal worker lifecycle; home-screen icon refresh remains OS-controlled.
