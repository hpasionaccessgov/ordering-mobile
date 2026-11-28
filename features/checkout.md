---
slug: checkout
title: Checkout
kind: feature
domain: orders
status: draft
summary: Review cart, place an order from explicit items, clear the cart and open the new order.
aliases: []
entry:
  - screen /checkout
files:
  - src/pages/Checkout.tsx
tests:
  - src/App.test.tsx
data: []
config: []
connections:
  - cart-manage: cart lines become the order item payload
  - order-tracking: navigation to /orders/:id after the order is created
hubs:
  - hub-api-client: placeOrder and clearCart use the bearer envelope
  - hub-ui-components: StateViews and CheckoutLines render the review
updated: 2026-11-28
---

# Checkout

## Summary

Checkout re-reads the server cart, shows a review of lines and total, and submits explicit product ids
and quantities to `POST /orders`. The backend snapshots prices and computes the total. On success the
cart is cleared and the customer lands on the new order's detail screen.

## Example use

```bash
# http://localhost:5173/checkout (requires a non-empty cart)
curl -sS -X POST http://localhost:8080/api/orders \
  -H 'Authorization: Bearer REPLACE_WITH_TOKEN' -H 'Content-Type: application/json' \
  -d '{"items":[{"product_id":2,"quantity":1}]}'
npm run test:unit -- src/App.test.tsx
```

## Entry points

| Entry | Handler | Kind / access | Note |
|---|---|---|---|
| `/checkout` | `Checkout` | screen, bearer | Reached from Cart; not in the tab bar |

## Chain

- Entry: `Checkout` in `src/pages/Checkout.tsx`.
- Logic: `getCart`, `clearCart` in `cartService`; `placeOrder` in `orderService`.
- Data: `CartSummary` → `{items:[{product_id, quantity}]}` → `Order`.
- Presentation: `CheckoutLines`, total block, `StateViews`, `useIonToast`.
- Config: token from `tokenStorage` via `hub-api-client`.

## Flow

1. `useIonViewWillEnter` runs `Checkout.load` → `getCart`.
2. Empty cart renders `ErrorState` with the empty-cart message; submit is unavailable.
3. `Checkout.submit` maps `cart.lines` to `{product_id, quantity}` and calls `placeOrder`.
4. Backend validates stock/prices and creates the order; returned `Order` includes `order_number`.
5. `clearCart` is called best-effort; its failure is swallowed with an explanatory comment.
6. Success toast shows the order number; `navigate('/orders/{id}', {replace:true})`.
7. Validation failures surface field errors through `firstError`.

## Gotchas

- Displayed total may differ from the server total when prices changed; the server total wins.
- Clearing the cart after order creation is not atomic. A failed clear leaves stale lines.
- `replace: true` removes checkout from history, so Back returns to the previous screen, not checkout.
- No payment step exists; orders are placed directly through the backend order service.

## Tests

`npm run test:unit -- src/App.test.tsx` proves the shell renders. No test for the place/clear/navigate
sequence; add `src/pages/Checkout.test.tsx`.

## Changelog

- 2026-11-28 (docs, initial): mapped explicit-items checkout and best-effort cart clear. Test: Checkout.submit
