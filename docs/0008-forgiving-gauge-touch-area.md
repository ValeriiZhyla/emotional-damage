# Forgiving gauge touch area

Status: Accepted

Date: 2026-11-14

## Context

The user reports that slightly missing the slider in Telegram or ChatGPT's
in-app browser still moves the surrounding browser sheet. The previous guard
only handled touchmove on the 120px-wide native input during an active drag.
Blank space and endpoint drawings remained outside it. This decision supersedes
the input-only scope of [decision 0006](0006-embedded-browser-drag-gestures.md).

## Decision

Make the existing instrument section the protected region, without changing its
appearance or adding another focusable control. Apply touch-action: none and
disable text selection there. Non-passive touchstart and touchmove listeners
consume default panning from the start and request Telegram's optional native
gesture cancellation, including for touches that miss the input. Keep the bridge
failure-tolerant as in decision 0006. A touchstart on a level button retains its
default action so a native tap still clicks; its touchmove is consumed.

Delegate pointerdown from the instrument's blank space and endpoint drawings to
the existing slider drag behavior. Exclude level buttons, keep focus and pointer
capture on the native range, and continue using its existing movement/end handlers.
Treat a contact within 24 CSS pixels of the handle as a grab, preserving its
initial offset rather than jumping. Contacts farther away use absolute position.
Keep keyboard operation, twenty values, stored-state schema and dialog behavior.
Advance the offline shell to v12.

The standard gesture policy is based on the W3C
[touch-action rules](https://www.w3.org/TR/pointerevents3/#the-touch-action-css-property)
and [Touch Events default-action cancellation](https://w3c.github.io/touch-events/#the-touchstart-event).
Telegram source and the optional bridge's limitations remain documented in 0006.

## Consequences

A less precise touch can move the gauge without panning the web content, and
swiping a label is also protected. Outside this section, including Info and
Settings, native gestures and overflow remain available. There is no document-wide
scroll lock, browser sniffing, external SDK, visual redesign or new dependency.

Native host sheet gestures are controlled by the containing app. Browser engine
tests cover the expanded region, early cancellation, native taps/swipes, pointer
capture cleanup, optional bridge contract and missing/throwing bridges. They do
not reproduce the actual Telegram or ChatGPT iPhone overlay. No private ChatGPT
host API is assumed, and full cancellation in every host cannot be guaranteed.
