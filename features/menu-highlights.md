---
slug: menu-highlights
title: Menu highlights
kind: feature
domain: catalog
status: active
summary: Menu shows today's specials, featured items and ranked best sellers above the full list.
aliases: []
entry:
  - screen /products
files:
  - src/pages/Products.tsx
  - src/services/catalogService.ts
  - src/theme/app.css
tests:
  - src/services/catalogService.test.ts
data: [highlights]
config: []
connections:
  - catalog-browse: highlights sit above the paginated product list on the same screen.
  - hub-best-sellers: backend ranks completed-order sales with ProductReportService::bestSellers.
hubs:
  - hub-api-client: getHighlights uses request with auth disabled and unwraps the envelope.
  - hub-ui-components: highlight strips reuse ProductCard; best-seller rows use plain Ionic items.
  - hub-theme: highlight strip and rank chip classes live in app.css.
updated: 2026-11-28
---

# Menu highlights

## Summary

The Menu screen opens with three compact sections sourced from one public endpoint: Today's specials,
Featured drinks & bites and Best sellers. Each highlighted product can be opened or added to the cart
using the same handlers as the full menu.

## Example use

http://localhost:8100/products

`npm run test:unit -- src/services/catalogService.test.ts`

## Entry points

| Entry | Handler (Symbol) | Kind / access | Note |
|---|---|---|---|
| screen /products | `Products` highlight sections | public endpoint | Rendered above the paginated menu list. |

## Chain

- entry: `src/App.tsx` renders `Products` on `/products`.
- logic: `getHighlights()` returns the three lists; no client-side filtering of a partial page.
- data: `GET /api/products/highlights` from the backend's product controller.
- presentation: horizontal `ProductCard` strips and a ranked best-seller list.
- config: `VITE_API_BASE_URL` selects the API host.

## Flow

1. `Products.load()` fetches highlights, the first menu page and favorites in parallel.
2. Specials and featured products render as horizontal strips using `ProductCard`.
3. Best sellers render with `#1..#5` rank chips and units sold from the API.
4. Pull-to-refresh reloads all three requests through the same loader.
5. Add and heart actions reuse the menu screen's existing handlers.

## Gotchas

- The endpoint is public; favorites are still loaded with the bearer token.
- Specials and featured lists are server-filtered and capped at eight, so they are not derived from the
  first menu page.
- Best sellers count only completed orders for active products; the list can be empty.

## Tests

`src/services/catalogService.test.ts` asserts the highlights path and public access.

## Changelog

- 2026-11-28 (feat, local): web menu showed specials, featured drinks and best sellers -> mobile showed only a flat list -> added one public highlights endpoint and three menu sections. Test: getHighlights
