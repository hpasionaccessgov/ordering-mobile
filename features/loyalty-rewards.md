---
slug: loyalty-rewards
title: Loyalty and rewards
kind: feature
domain: account
status: active
summary: Rewards screen shows tier progress and points, redeems treats and lists the loyalty ledger.
aliases: []
entry:
  - screen /rewards
files:
  - src/pages/Rewards.tsx
  - src/services/loyaltyService.ts
tests:
  - src/services/loyaltyService.test.ts
data: [loyalty_point_transactions]
config: []
connections:
  - customer-dashboard: dashboard shows the same tier and point figures.
  - order-tracking: redemption creates a pending order visible in the order list.
hubs:
  - hub-api-client: loyalty calls use request and requestPage.
  - hub-ui-components: StateViews covers loading, error and empty states.
  - hub-app-routing: /rewards is a protected route.
updated: 2026-11-28
---

# Loyalty and rewards

## Summary

The Rewards screen turns the existing loyalty API into a mobile view: tier progress from lifetime
earned points, available treats with a Redeem action, and the caller's own points ledger.

## Example use

http://localhost:8100/rewards

`npm run test:unit -- src/services/loyaltyService.test.ts`

## Entry points

| Entry | Handler (Symbol) | Kind / access | Note |
|---|---|---|---|
| screen /rewards | `Rewards` | bearer | Protected route linked from Account. |

## Chain

- entry: `src/App.tsx` renders `Rewards` on `/rewards`.
- logic: `getLoyalty`, `listRewards`, `redeemReward`, `listTransactions`.
- data: `/api/loyalty`, `/api/rewards`, `/api/rewards/{id}/redeem`, `/api/loyalty/transactions`.
- presentation: progress bar, reward cards and ledger rows; `StateViews` for states.
- config: none beyond the API base URL.

## Flow

1. `Rewards` calls `load()` on enter to fetch the summary, rewards and first ledger page.
2. Tier progress is computed from `lifetimeEarned` with thresholds 100 and 500.
3. Redeem is disabled when `current` is below `point_cost`.
4. `redeemReward(id)` posts to the API and returns the points transaction with `order_number`.
5. A success toast is shown and `load()` refreshes the figures.
6. `listTransactions(page)` appends more ledger rows on request.

## Gotchas

- `GET /api/loyalty` wraps the figures in `data.summary`; transactions are a bare paginated array.
- `POST /api/rewards/{id}/redeem` returns 201 and creates a free pending order.
- Points and costs are integers, not prices; do not format as currency.

## Tests

`src/services/loyaltyService.test.ts` asserts the summary unwrap and redeem path.

## Changelog

- 2026-11-28 (feat, local): mobile had no points or redemption UI -> added rewards screen and services. Test: getLoyalty
