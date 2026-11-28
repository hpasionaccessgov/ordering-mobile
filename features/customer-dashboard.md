---
slug: customer-dashboard
title: Customer dashboard
kind: feature
domain: account
status: active
summary: Account screen shows spend, favorites and loyalty KPIs with quick links to customer services.
aliases: []
entry:
  - screen /account
files:
  - src/pages/Account.tsx
  - src/services/customerService.ts
tests:
  - src/services/customerService.test.ts
data: [customer-summary]
config: []
connections:
  - loyalty-rewards: reads the same loyalty summary for the tier KPI and progress bar.
  - favorites-manage: links to the saved-products screen.
  - notifications-inbox: links to the inbox and shows its unread count.
hubs:
  - hub-api-client: summary comes from GET /api/customer/summary through request.
  - hub-ui-components: KPI grid uses StateViews for loading and error states.
  - hub-app-routing: /account is a protected tab route.
updated: 2026-11-28
---

# Customer dashboard

## Summary

The Account tab is the customer home. It combines the backend summary KPIs (orders, completed spend,
favorites) with the loyalty summary, then links to Rewards, Favorites and Notifications. Logout stays here.

## Example use

http://localhost:8100/account

`npm run test:unit -- src/services/customerService.test.ts`

## Entry points

| Entry | Handler (Symbol) | Kind / access | Note |
|---|---|---|---|
| screen /account | `Account` | bearer | Protected tab; loads summary and loyalty on enter. |
| -> hub-app-routing | `RequireAuth` | event | Gate and tab registration are inherited. |

## Chain

- entry: `src/App.tsx` renders `Account` on `/account`.
- logic: `getCustomerSummary` and `getLoyalty` return server-owned figures.
- data: `GET /api/customer/summary`, `GET /api/loyalty`; token from Capacitor Preferences.
- presentation: KPI cards, progress bar and quick links; `StateViews` for states.
- config: `VITE_API_BASE_URL` selects the API host.

## Flow

1. `RequireAuth` admits a signed-in user.
2. `Account` calls `load()` on `useIonViewWillEnter`.
3. `getCustomerSummary()` fetches order count, completed spend and favorite figures.
4. `getLoyalty()` fetches points, tier and lifetime totals.
5. The screen renders KPI cards and a tier progress bar using the web thresholds.
6. Quick links navigate to `/rewards`, `/favorites`, `/notifications` and `/orders`.
7. Log out calls `signOut()` from `AuthContext` and navigates to `/login`.

## Gotchas

- `total_spent` is a decimal string; format with `Number(value).toFixed(2)`.
- Tier thresholds are 100 and 500 lifetime earned points, matching the web rewards page.
- `favorite_product` is null until the customer saves a product.

## Tests

`src/services/customerService.test.ts` asserts the summary path and envelope unwrap.

## Changelog

- 2026-11-28 (feat, local): mobile had no customer statistics -> added summary KPIs and service links. Test: getCustomerSummary
