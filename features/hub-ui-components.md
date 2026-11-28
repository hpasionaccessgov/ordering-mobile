---
slug: hub-ui-components
title: Shared UI components
kind: hub
domain: shared
area: shared
status: active
summary: Shared header, state views, product card and status badge give every screen one visual contract.
aliases: []
implicit: [all features]
exposed_as: named/default imports from src/components/
files:
  - src/components/AppHeader.tsx
  - src/components/StateViews.tsx
  - src/components/ProductCard.tsx
  - src/components/StatusBadge.tsx
tests:
  - src/App.test.tsx
data: []
config: []
updated: 2026-11-28
---

# Shared UI components

## Summary

Four components are reused across screens: `AppHeader` (toolbar), `StateViews` (loading/error/empty),
`ProductCard` (menu item) and `StatusBadge` (order status). Reuse them before adding markup; only
status-specific screens deviate.

## Contract

- `AppHeader({title, actions?})` → cream toolbar with logo/brand lockup, page title and optional end-slot buttons.
- `LoadingState({label?})`, `ErrorState({message, onRetry?})`, `EmptyState({title, message, action?})`.
- `ProductCard({product, onOpen, onAdd, busy?, favorite?, onToggleFavorite?})`: card click opens detail; Add stops propagation; heart is optional.
- `StatusBadge({status})`: maps `OrderStatus` to `STATUS_LABELS` and an Ionic badge color.
- All exports declare `: React.JSX.Element` (eslint `explicit-module-boundary-types`).

## Example use

`Products` renders `ProductCard` and `StateViews` — see `src/pages/Products.tsx`.

## Gotchas

- `IonItem` has no `fill` prop; use `fill="outline"` on `IonInput`.
- Icon imports must exist as camelCase exports in `node_modules/ionicons/icons/index.d.ts`.
- `StatusBadge` falls back to `medium` for unknown statuses; do not add new status strings silently.
- Add-to-cart and the favorite heart both use `event.stopPropagation()` so the card's open handler does not fire.
- Pass `favorite` only on authenticated screens; the heart is hidden when the prop is undefined.
- Header logo uses `/Cafebara_logo-320.png` with empty alt; it is decorative, the title carries the page.
- API product images go through `assetUrl`; bundled assets keep their leading `/` as-is.
- Keep the `cafebara-*` CSS class prefix; styles live in `src/theme/app.css`.

## Changelog

- 2026-11-28 (fix, local): product photos were blank in the browser -> relative API paths hit the SPA origin -> ProductCard renders assetUrl(product.image_url). Test: assetUrl
- 2026-11-28 (feat, local): menu cards had no favorite control -> added optional heart props to ProductCard. Test: ProductCard
- 2026-11-28 (refactor, local): header used a generic café icon -> replaced with Cafébara logo and brand lockup. Test: AppHeader
- 2026-11-28 (docs, initial): recorded shared component props and Ionic type traps. Test: ProductCard
