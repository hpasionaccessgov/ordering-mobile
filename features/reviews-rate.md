---
slug: reviews-rate
title: Product reviews
kind: feature
domain: account
status: active
summary: Product detail shows ratings and lets customers review products from completed orders.
aliases: []
entry:
  - screen /products/:id
files:
  - src/services/reviewService.ts
tests:
  - src/services/reviewService.test.ts
data: [product_reviews]
config: []
connections:
  - catalog-browse: parent screen owns src/pages/ProductDetail.tsx; this feature owns its review section.
  - order-tracking: only completed orders containing the product make a review eligible.
hubs:
  - hub-api-client: review calls use request.
  - hub-ui-components: review form reuses Ionic inputs and StateViews conventions.
updated: 2026-11-28
---

# Product reviews

## Summary

Product detail renders the rating summary and recent reviews returned by the API. A review form is
shown only when the backend reports an eligible completed order for that product.

## Example use

http://localhost:8100/products/33

`npm run test:unit -- src/services/reviewService.test.ts`

## Entry points

| Entry | Handler (Symbol) | Kind / access | Note |
|---|---|---|---|
| screen /products/:id | `ProductDetail` review section | bearer | Shared with catalog-browse. |

## Chain

- entry: `src/App.tsx` renders `ProductDetail`; this feature adds its review section.
- logic: `getReviews`, `createReview`.
- data: `GET /api/reviews?product_id=`, `POST /api/reviews`.
- presentation: rating summary, review list and order picker.
- config: none beyond the API base URL.

## Flow

1. `ProductDetail` calls `getReviews(product.id)` after the product loads.
2. The screen renders `summary.average`, `summary.count` and each review.
3. If `eligible_orders` is non-empty, the form offers those order numbers in a picker.
4. `createReview` posts `{product_id, order_id, rating, review}`.
5. A success toast is shown and `getReviews` reloads the section.

## Gotchas

- `order_id` must come from the backend's `eligible_orders`; typing one manually is not allowed.
- Rating is an integer from 1 to 5; review text is 1 to 1000 characters.
- A duplicate review for the same order and product returns `400`.

## Tests

`src/services/reviewService.test.ts` asserts the query string and create payload.

## Changelog

- 2026-11-28 (feat, local): mobile had no ratings or review flow -> added summary, list and form. Test: getReviews
