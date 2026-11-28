---
slug: order-tracking
title: Order history and status tracking
kind: feature
domain: orders
status: draft
summary: Order list and detail show server status with a timeline, pull refresh and timed polling.
aliases: []
entry:
  - screen /orders
  - screen /orders/:id
files:
  - src/pages/Orders.tsx
  - src/pages/OrderDetail.tsx
tests:
  - src/App.test.tsx
data: []
config: []
connections:
  - checkout: newly created orders are opened by id here
hubs:
  - hub-api-client: listOrders/getOrder/cancelOrder use the bearer envelope
  - hub-ui-components: StatusBadge and StateViews render status and states
updated: 2026-11-28
---

# Order history and status tracking

## Summary

Customers see their own orders newest first, then open one to see a status timeline, itemised totals
and a manual refresh. Detail polls every 20 seconds so a status change made in the web admin panel
appears without a reload. Pending orders can be cancelled.

## Example use

```bash
# http://localhost:5173/orders -> tap first row -> http://localhost:5173/orders/1
curl -sS http://localhost:8080/api/orders/1 -H 'Authorization: Bearer REPLACE_WITH_TOKEN'
npm run test:unit -- src/App.test.tsx
```

## Entry points

| Entry | Handler | Kind / access | Note |
|---|---|---|---|
| `/orders` | `Orders` | screen, bearer | Tab; pull-to-refresh |
| `/orders/:id` | `OrderDetail` | screen, bearer | Timed polling while mounted |

## Chain

- Entry: `Orders`, `OrderDetail` in `src/pages/`.
- Logic: `listOrders`, `getOrder`, `cancelOrder` in `orderService`.
- Data: `Order` rows with `status`, timestamps and `items` from the backend.
- Presentation: `StatusBadge`, `StateViews`, `IonRefresher`, timeline `IonItem` rows.
- Config: `STATUS_LABELS` in `src/services/types.ts`.

## Flow

1. `Orders` enters → `listOrders` → state set from `Page<Order[]>.items`.
2. Each row shows order number, date, total and `StatusBadge`; tap navigates to detail.
3. `OrderDetail.load` fetches `GET /orders/{id}` and records `currentStep` from `TRACKED.indexOf`.
4. Timeline marks steps up to `currentStep` with `checkmarkCircle`; later steps use `timeOutline`.
5. `useEffect` starts a 20 s `setInterval(load)`; cleanup clears it on unmount.
6. Refresh status button calls `load` directly; cancel button calls `cancelOrder` for pending orders.
7. Cancelled orders display a danger-labelled row; no timeline step is reached.

## Gotchas

- `TRACKED` omits `cancelled`, so `indexOf` returns `-1` and only the extra cancelled row is shown.
- Polling continues while the detail screen is mounted even when the app is backgrounded.
- `created_at` is Unix seconds; `new Date(value * 1000)` is required.
- Staff tokens can read all orders; customers are scoped to their own by the backend.
- `busy` only gates the cancel button, not the poll.

## Tests

`npm run test:unit -- src/App.test.tsx` proves the shell renders. No test for timeline mapping or
polling cleanup; add `src/pages/OrderDetail.test.tsx`.

## Changelog

- 2026-11-28 (docs, initial): mapped status timeline, 20 s poll and cancel path. Test: OrderDetail.load
