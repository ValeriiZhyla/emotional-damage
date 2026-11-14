# Natural language UI copy

Status: Accepted

Date: 2026-11-14

## Context

English, German and Russian copy used literal translations, vague metaphors and
unusual control names. The installation hint presented one browser action as
universal, omitted Safari's Share menu and did not match current iPhone labels.
The user requested concise, idiomatic wording throughout the app.

## Decision

Review each locale independently, keeping the same intent without requiring
word-for-word equivalence. Use conversational language, informal singular address
in German and Russian, gender-neutral Russian descriptions, and standard control
names. Keep the colored question and the four existing zone names. Descriptions
remain approximate observations, without diagnoses or instructions for recovery.

Replace decorative settings terminology with Settings / Einstellungen /
Настройки and recognizable haptic labels. State that the last position and
preferences stay in the current browser/device, and that clearing site data loses
both. When storage fails, explain that reloading also loses the current position.
Keep English HTML fallbacks, accessible labels and app descriptions consistent.

Identify the installation hint as iPhone/Safari instructions. Use these documented
Share-menu actions, rather than translating the English menu name ourselves:

- English: Share → Add to Home Screen
- German: Teilen → Zu Home-Bildschirm hinzufügen
- Russian: Поделиться → На экран „Домой“

Sources checked on 2026-11-14: Apple’s iPhone guides for
[English](https://support.apple.com/en-asia/guide/iphone/iph42ab2f3a7/ios),
[German](https://support.apple.com/de-de/guide/iphone/iphea86e5236/ios) and
[Russian](https://support.apple.com/ru-ru/guide/iphone/iph42ab2f3a7/27/ios/27).
Menu wording can differ across OS versions; these are the current documented
iPhone labels, not a claim about all browsers or iPadOS.

## Consequences

No new UI, dependencies, behavior or storage schema are needed. The offline shell
version advances so translated assets are cached together. Browser verification
covers locale switching, persistence, blocked storage, offline use, modal access
and layout with the revised copy. Editorial review is performed by the current
agent; no human native-speaker or physical-device review is implied.
