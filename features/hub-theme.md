---
slug: hub-theme
title: Cafébara theme tokens
kind: hub
domain: shared
area: shared
status: active
summary: Ionic color variables and cafebara-* layout classes define the shared look in two CSS files.
aliases: []
implicit: [all features]
exposed_as: CSS custom properties and cafebara-* classes from src/theme/
files:
  - src/theme/variables.css
  - src/theme/app.css
tests:
  - src/App.test.tsx
data: []
config: []
updated: 2026-11-28
---

# Cafébara theme tokens

## Summary

`variables.css` overrides Ionic colors with the Cafébara brown/cream palette from the web app;
`app.css` holds screen layout under `cafebara-*` classes. Every screen inherits both. Changing a token
here changes the whole app, including the Android WebView.

## Contract

- Primary `#89431c`, secondary `#f8e6cb`, tertiary `#c88b4a`, background `#fffaf3`, text `#301206`.
- Dark mode overrides in `@media (prefers-color-scheme: dark)` use dark brown and warm cream text.
- `cafebara-toolbar`, `-auth-panel`, `-product-card`, `-state`, `-qty`, `-total`, `-timeline` are shared classes.
- Color tokens are referenced as `var(--ion-color-*)` and `rgba(var(--ion-color-*-rgb), ...)`.

## Example use

`cafebara-product-card` — see `src/theme/app.css`.

## Gotchas

- Both RGB and hex variants must be updated together or translucent styles break.
- Dark mode is a media query, not a class; there is no in-app theme toggle.
- `androidScheme: 'http'` in `capacitor.config.ts` is unrelated to color tokens but affects WebView URL.
- Do not move layout classes into component files; `app.css` is the single source.

## Changelog

- 2026-11-28 (docs, initial): captured palette, dark-mode query and class prefix. Test: app.css
