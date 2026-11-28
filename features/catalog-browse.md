---
slug: catalog-browse
title: Catalog browsing
kind: feature
domain: catalog
status: draft
summary: Product list and detail screens load the active Cafébara menu from the public REST API.
aliases: []
entry:
  - screen /products
  - screen /products/:id
files:
  - src/pages/Products.tsx
  - src/pages/ProductDetail.tsx
tests:
  - src/App.test.tsx
data: []
config: []
connections:
  - cart-manage: product cards and detail call addToCart
hubs:
  - hub-api-client: listProducts/getProduct unwrap the envelope and pagination meta
  - hub-ui-components: ProductCard and StateViews render every item and state
updated: 2026-11-28
---

# Catalog browsing

## Summary

Menu screen lists active products with price, image and an Add action. Tapping a card opens product
detail with a larger image and a direct link to the cart. Both screens read public endpoints; no
login is needed to browse.

## Example use

```bash
# http://localhost:5173/products -> tap a card -> http://localhost:5173/products/2
curl -sS http://localhost:8080/api/products?page=0
npm run test:unit -- src/App.test.tsx
```

## Entry points

| Entry | Handler | Kind / access | Note |
|---|---|---|---|
| `/products` | `Products` | screen, public | Also the default tab and `/` redirect target |
| `/products/:id` | `ProductDetail` | screen, public | `id` read from `useParams` |
| `-> hub-app-routing` | `IonTabButton tab="products"` | inherited | Tab entry points at `/products` |

## Chain

- Entry: `Products`, `ProductDetail` in `src/pages/`.
- Logic: `listProducts`, `getProduct` in `catalogService`; `addToCart` in `cartService`.
- Data: `Product` rows from `GET /products` and `GET /products/{id}`; no local cache.
- Presentation: `ProductCard`, `LoadingState`, `ErrorState`, `EmptyState`, `IonRefresher`.
- Config: public auth is declared by `auth: false` on the service calls.

## Flow

1. `useIonViewWillEnter` calls `Products.load` on first render and every return.
2. `listProducts` calls `requestPage('/products?page=0', {auth:false})`.
3. Products state is set from `Page<Product[]>.items`; errors go to `firstError`.
4. `ProductCard` renders name, description, price and Add; card click navigates to detail.
5. `ProductCard` Add calls `cartService.addToCart` and shows a success toast.
6. `ProductDetail.load` fetches one product by `Number(id)`.
7. Detail Add calls `addToCart`, then navigates to `/cart`.
8. `IonRefresher` re-runs `load` and completes on both success and failure.

## Gotchas

- Backend clamps `per-page`; the client requests only `page` and does not implement infinite scroll.
- `meta.pagination.current_page` is one-based while the query parameter is zero-based.
- `image_url` may be null; both screens omit the image element in that case.
- `description` may be null; render it directly inside `IonText` only.
- Product `status` is numeric and the backend filters inactive rows; the app does not re-filter.

## Tests

`npm run test:unit -- src/App.test.tsx` proves the shell renders only. No service or screen test yet
for pagination, retry or Add-to-cart; add `src/services/catalogService.test.ts`.

## Changelog

- 2026-11-28 (docs, initial): mapped public catalog screens and pagination caveat. Test: Products.load
