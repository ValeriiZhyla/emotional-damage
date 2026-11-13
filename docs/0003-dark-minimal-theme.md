# 0003: Dark minimal theme

- Status: Accepted
- Date: 2026-11-13

## Context

The user wants Emotional Damage to match the dark, minimal personal website,
likes the colored italic question emphasis, and dislikes the changing page
background. They requested the style change now and ideas for any later
background treatment.

## Decision

Use the homepage's #101010 canvas, off-white primary text, neutral supporting
text, thin gray borders, restrained corner radii and system sans-serif headings.
Retain the italic serif emphasis and its green-to-red progression, using lighter
accent colors for legibility on dark surfaces. Keep the gauge's color scale and
heart/skull illustrations.

Keep the page background and browser theme color constant at every position.
Apply dark styling to both dialogs, controls, manifest and home-screen icons,
regardless of the operating system's light/dark preference. Preserve responsive
geometry, mobile illustration clearance, input behavior and localStorage schema.
Advance the offline shell cache to v4.

## Consequences

The app shares the website's visual foundation while retaining its expressive
question and scale. Selecting a stress level changes existing accents and the
selected label, without recoloring the page or browser chrome. Saved positions
and preferences survive the release.

Possible follow-ups are still proposed: color the handle's thin border, add a
small halo behind it, or use a very faint edge tint. These additional effects are
not implemented; the user will choose whether to add one.
