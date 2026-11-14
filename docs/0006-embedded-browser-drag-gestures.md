# Embedded browser drag gestures

Status: Accepted

Date: 2026-11-14

## Context

The user reports that dragging the gauge also moves Telegram's browser overlay
on iPhone, while a normal browser works correctly. The slider already uses
`touch-action: none` and pointer capture. Those govern web content, while the host
app can recognize its own native sheet gesture.

Telegram's iOS browser injects an observer that detects dragging by changes to
`top`, `left` or `transform` on the touched element or its ancestors. Our full-height
native input stays in place; the moving handle is a separate sibling. That
observer therefore does not detect our handle movement. This is a source-based
explanation of the reported conflict, not a physical-device reproduction.

## Decision

During an active gauge drag, handle `touchmove` on the input with a non-passive
listener. Cancel its default panning when possible, and, if available, send the
same `cancellingTouch` event that Telegram's browser uses for draggable content
through `window.TelegramWebviewProxy.postEvent` with an empty JSON payload.

Keep the listener local to the input and conditional on an active drag. Do not
stop propagation, lock the whole document, suppress dialog scrolling, detect the
browser by its user agent, or load external scripts. Absence, malformed methods
and exceptions from the host bridge must not interrupt the gauge. Keep existing
pointer cancellation, keyboard access, movement scheduling and local persistence.
Advance the offline shell to v10 for the changed script.

The behavior is based on Telegram iOS source at commit
`24638bc69bd083981b178dd1e7f921eebbf7fc46`, checked on 2026-11-14:

- [Browser touch observer, bridge and native message handling](https://github.com/TelegramMessenger/Telegram-iOS/blob/24638bc69bd083981b178dd1e7f921eebbf7fc46/submodules/BrowserUI/Sources/BrowserWebContent.swift)
- [Cancellation of containing native gestures](https://github.com/TelegramMessenger/Telegram-iOS/blob/24638bc69bd083981b178dd1e7f921eebbf7fc46/submodules/BrowserUI/Sources/BrowserScreen.swift)
- [Touch event default-action cancellation](https://w3c.github.io/touch-events/#the-touchmove-event)

## Consequences

The bridge is an undocumented host capability, not the public Mini App API. Its
behavior can vary by Telegram version. Browser tests verify our event contract,
native Chromium touches, scope, failure tolerance, persistence and accessibility;
they cannot reproduce Telegram's UIKit overlay. Real iPhone/Telegram confirmation
remains a user-side follow-up. Safari remains a usable fallback if a host version
ignores cancellation. No visual, server, dependency or storage-schema change is
required.
