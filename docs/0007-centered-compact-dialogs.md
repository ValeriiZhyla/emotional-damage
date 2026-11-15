# Centered compact dialogs

Haptic feedback was removed by [decision 0016](0016-remove-haptic-feedback.md).

Status: Accepted

Date: 2026-11-14

## Context

The user dislikes Info and Settings scrolling and Settings sitting at the bottom
of the phone screen. The original mobile sheet has a fixed bottom margin and a
viewport-height cap. Separate decorative eyebrows, stacked language choices,
generous spacing and long descriptions consume more height than necessary.
Device-sized tests also overestimate the space available below browser chrome.

## Decision

Keep native modal dialogs and center them at all screen widths. Let content
determine their height, with a dynamic-viewport maximum and safe-area allowance.
Use a short fade instead of an upward sheet animation.

Put the title and a 44px close control in one header row. Remove redundant dialog
eyebrows and their unused translations. Focus the heading when opening so the
screen reader starts at the content and the close button does not acquire an
initial control outline. Interactive controls retain keyboard-visible focus;
native Escape and focus restoration remain intact.

Place the three language choices in one row at normal text sizes. Retain native
radios, language autonyms and 44px targets. A font-relative grid can wrap when
text is enlarged. Keep optional haptics and the existing storage/install copy.

Shorten the Info introduction, four descriptions and footnote independently in
English, German and Russian. Retain the four states, descriptive intent and
medical-advice distinction. Reduce excess spacing while keeping readable body
text; secondary settings/footer text increases from 11px to 12px.

Fit both complete dialogs at normal phone browser viewports of 375×640 and
440×740 in every language, even with haptics shown. Preserve the existing wider
desktop layout. Keep automatic overflow for exceptionally short screens or
enlarged text; never hide the final text or disable access just to remove scrolling.

## Consequences

Normal phone dialogs have no internal scrolling and stay centered, including when
switching languages. A small-screen/doubled-text check verifies that overflow is
still usable and every paragraph/control remains reachable. Header focus, Tab,
Escape, localization, accessibility and viewport fit are regression-tested.

Offline shell advances to v11. The gauge, Telegram gesture guard, storage schema,
palette, server configuration and external dependencies are unchanged. Browser
verification covers Chromium and mobile WebKit; physical iPhone/browser chrome
testing is not claimed.
