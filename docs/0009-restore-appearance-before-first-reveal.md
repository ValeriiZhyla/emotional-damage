# Restore appearance before first reveal

Status: Accepted

Date: 2026-11-14

## Context

The user sees a green default gauge briefly animate to the saved position and
colour when opening or repeatedly reloading. The module restores state after
HTML/CSS defaults may already be painted; normal handle and ambient transitions
can then animate that initial restoration.

## Decision

Load a tiny same-origin blocking boot.js before the stylesheet and body. It only
marks startup on the root; it does not duplicate state validation or the palette.
During startup, hide the app with visibility and suppress transitions/animations.
The existing module remains the single owner of reading/validating storage and
rendering the value, accent, selected zone, language and settings.

After that render, resolve handle layout with startup transitions still disabled,
then remove the startup marker to reveal the complete restored interface. Normal
interactive movement keeps its existing transitions; no loading spinner, fade or
delay timer is added. The fixed dark canvas is visible while the app initializes.

Include boot.js in the v12 offline shell, syntax checks and
public asset verification. Keep the saved-state schema, CSP and hosting unchanged.
Because JavaScript sets the marker, disabling scripting keeps the existing static
page and noscript explanation available.

Execution order and style-change handling follow the
[HTML script processing model](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)
and [CSS transition start rules](https://www.w3.org/TR/css-transitions-1/#starting).

## Consequences

The first visible app frame has the saved appearance, including with slow module
loading. There is one small additional cacheable request on a first online visit.
Initialization still works with unavailable/malformed storage through the normal
validated defaults. An offline visit uses the same boot path from the shell cache.

Cross-engine regression tests deliberately hold the module response while the
page parses, verify that no default UI frame is exposed, then sample visible
animation frames across repeated red/green reloads. Check position, accent, zone,
locale and absence of startup animations; keep the existing gesture, offline,
storage, keyboard, reduced-motion and accessibility coverage.
