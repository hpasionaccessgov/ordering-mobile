---
slug: hub-theme
title: Cafébara theme tokens
kind: hub
domain: shared
area: shared
status: active
summary: Ionic tokens, brand logo, Android icons and cafebara-* classes mirror the web look.
aliases: []
implicit: [all features]
exposed_as: CSS custom properties and cafebara-* classes from src/theme/
files:
  - src/theme/variables.css
  - src/theme/app.css
  - index.html
  - public/manifest.json
  - public/Cafebara_logo.png
  - public/Cafebara_logo-320.png
  - public/Cafebara_logo-512.png
  - public/favicon.png
  - android/app/src/main/res/
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

- Primary `#89431c`, cream `#f8e6cb`, tertiary `#c88b4a`, background `#fbf8f4`, text `#2f211a`.
- Extra tokens `--cafebara-surface`, `-surface-raised`, `-border`, `-muted` mirror the web theme.
- Dark mode uses `#160d09` background, `#21130d` surfaces and `#f8eee4` text.
- Brand: `public/Cafebara_logo.png`; screens use derived `/Cafebara_logo-320.png`, manifest uses `-512.png`.
- `index.html` and `manifest.json` carry the Cafébara title, favicon and theme color.
- Android launcher PNGs in `res/mipmap-*/` and splash PNGs in `res/drawable*/` use the logo on cream `#f8e6cb`.
- `res/values-v31/styles.xml` gives Android 12+ the same cream splash background and logo icon.
- `cafebara-toolbar`, `-auth-brand`, `-auth-panel`, `-product-card`, `-state`, `-qty`, `-total`, `-timeline` are shared classes.

## Example use

`cafebara-product-card` — see `src/theme/app.css`.

## Gotchas

- Both RGB and hex variants must be updated together or translucent styles break.
- Dark mode is a media query, not a class; there is no in-app theme toggle.
- The `-320`, `-512`, favicon, launcher and splash PNGs are derived from `public/Cafebara_logo.png`; regenerate all if the logo changes.
- Auth and hero panels use fixed white text on the brown gradient; do not swap in a light background.
- `drawable-v24/ic_launcher_foreground.xml` is the stale Capacitor vector; the launcher uses the PNG foreground instead.
- `androidScheme: 'http'` in `capacitor.config.ts` is unrelated to color tokens but affects WebView URL.
- Do not move layout classes into component files; `app.css` is the single source.

## Changelog

- 2026-11-28 (feat, local): highlight strips and rank chips had no layout -> added cafebara-highlight and cafebara-rank classes. Test: app.css
- 2026-11-28 (feat, local): customer KPIs, rewards and inbox had no styling -> added shared panel, progress and card classes. Test: app.css
- 2026-11-28 (refactor, local): inner screens still used default Ionic chrome -> styled lists, cards, states, tab bar and branded Android launcher/splash. Test: app.css
- 2026-11-28 (refactor, local): mobile screens did not match the web brand -> synced web tokens, added logo assets and auth gradient panels. Test: AppHeader
- 2026-11-28 (docs, initial): captured palette, dark-mode query and class prefix. Test: app.css
