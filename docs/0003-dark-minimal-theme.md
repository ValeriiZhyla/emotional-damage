# 0003: Dark minimal theme

- Status: Accepted
- Date: 2026-11-13
- Amended by: [0004: Ambient stress feedback](0004-ambient-stress-feedback.md)

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

Follow-up selection (2026-11-13): the user accepted the recommended thin colored
handle outline. Share the question's existing accent so both reflect the same
selected position, from green through amber and orange to red. Keep the white
keyboard focus ring and forced-colors override. Advance the offline shell to v5
without changing browser-local state. A halo or edge tint remains proposed.

Color correction (2026-11-13): the user found the exhausted accents too orange.
Start the red accent at position 15, the first Exhausted tick, and deepen it
through position 19. Use #ff4d5a for the exhausted dot, info marker and skull.
Keep the first three zones' accents and the entire gauge rail unchanged. Advance
the offline shell to v6; retain the fixed dark canvas and existing saved state.
