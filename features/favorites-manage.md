---
slug: favorites-manage
title: Favorites
kind: feature
domain: account
status: active
summary: Favorites screen and product heart let customers save products and remove saved ones.
aliases: []
entry:
  - screen /favorites
files:
  - src/pages/Favorites.tsx
  - src/services/favoriteService.ts
tests:
  - src/services/favoriteService.test.ts
data: [favorites]
config: []
connections:
  - catalog-browse: product cards expose a heart that toggles a favorite.
  - customer-dashboard: dashboard shows the favorite count and latest product.
hubs:
  - hub-api-client: favorite calls use request and requestPage.
  - hub-ui-components: ProductCard gained the optional favorite props; StateViews covers states.
  - hub-app-routing: /favorites is a protected route.
updated: 2026-11-28
---

# Favorites

## Summary

Customers can heart a product from the menu or product detail and manage saved products on one screen.
The API treats a favorite as a product id, and adding the same product twice is a no-op.

## Example use

http://localhost:8100/favorites

`npm run test:unit -- src/services/favoriteService.test.ts`

## Entry points

| Entry | Handler (Symbol) | Kind / access | Note |
|---|---|---|---|
| screen /favorites | `Favorites` | bearer | Protected route linked from Account. |

## Chain

- entry: `src/App.tsx` renders `Favorites` on `/favorites`.
- logic: `listFavorites`, `addFavorite`, `removeFavorite`, `isFavorite`.
- data: `/api/favorites`, `/api/favorites/{productId}`.
- presentation: favorite rows and `ProductCard` heart; `StateViews` for states.
- config: none beyond the API base URL.

## Flow

1. `Favorites` calls `listFavorites()` on enter and shows product name and price.
2. Tapping a row opens `/products/{productId}`.
3. The remove button calls `removeFavorite(productId)` then reloads.
4. `ProductCard` receives `favorite` and `onToggleFavorite` and shows a filled or outline heart.
5. `ProductDetail` uses the same pair and refreshes the flag after a toggle.

## Gotchas

- `DELETE /api/favorites/{id}` takes the **product id**, not the favorite row id.
- `POST /api/favorites` is idempotent and returns `added: false` on a repeat.
- The heart is hidden on screens that render products before login.

## Tests

`src/services/favoriteService.test.ts` asserts add, remove and list paths.

## Changelog

- 2026-11-28 (feat, local): mobile had no favorites -> added saved list and product heart. Test: addFavorite
