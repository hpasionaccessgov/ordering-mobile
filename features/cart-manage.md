---
slug: cart-manage
title: Cart management
kind: feature
domain: cart
status: draft
summary: Cart screen loads server-side lines and changes quantities through the REST cart service.
aliases: []
entry:
  - screen /cart
files:
  - src/pages/Cart.tsx
tests:
  - src/App.test.tsx
data: []
config: []
connections:
  - catalog-browse: Add buttons on menu and detail seed the cart
  - checkout: Checkout button navigates to /checkout
hubs:
  - hub-api-client: every cart call carries the bearer token and unwraps CartSummary
  - hub-ui-components: StateViews handles loading, error and empty states
updated: 2026-11-28
---

# Cart management

## Summary

The cart screen reads the server-owned cart, shows per-line subtotals and a total, and lets the
customer increment, decrement or remove lines. All mutations go through the backend; the app keeps no
local copy of cart state beyond the last response.

## Example use

```bash
# http://localhost:5173/cart (requires login)
curl -sS http://localhost:8080/api/cart -H 'Authorization: Bearer REPLACE_WITH_TOKEN'
npm run test:unit -- src/App.test.tsx
```

## Entry points

| Entry | Handler | Kind / access | Note |
|---|---|---|---|
| `/cart` | `Cart` | screen, bearer | Protected by `RequireAuth` |
| `-> hub-app-routing` | `IonTabButton tab="cart"` | inherited | Tab entry points at `/cart` |

## Chain

- Entry: `Cart` in `src/pages/Cart.tsx`.
- Logic: `getCart`, `updateCartItem`, `removeCartItem` in `cartService`.
- Data: `CartSummary` (`lines`, `total`, `count`) from the backend cart service.
- Presentation: `IonList`/`IonItem`, qty buttons, `StateViews`, `IonButton routerLink="/checkout"`.
- Config: token from `tokenStorage` via `hub-api-client`.

## Flow

1. `useIonViewWillEnter` calls `Cart.load` → `getCart` and stores `CartSummary`.
2. Empty result renders `EmptyState` with a Browse menu action using `useNavigate`.
3. Plus/minus buttons call `Cart.change(productId, quantity ± 1)` → `updateCartItem`.
4. Zero quantity removes the line via `removeCartItem` instead of a PATCH with `0`.
5. Responses replace the whole `cart` state; no optimistic local mutation.
6. Errors surface as `useIonToast` via `firstError`; the current cart stays visible.
7. Checkout button navigates to `/checkout` with the same server cart.

## Gotchas

- Backend `PATCH /cart/items/{id}` also accepts `quantity: 0`, but this screen uses DELETE for clarity.
- `busy` disables all quantity buttons at once, not just the touched line.
- Prices are strings; subtotals come from the server and are formatted with `Number(...).toFixed(2)`.
- Cart is per token owner, so switching accounts requires a reload to avoid showing the old cart.

## Tests

`npm run test:unit -- src/App.test.tsx` proves the shell renders. No dedicated test for quantity
branches or removal; add `src/pages/Cart.test.tsx`.

## Changelog

- 2026-11-28 (docs, initial): mapped server-owned cart mutations and empty-state path. Test: Cart.change
