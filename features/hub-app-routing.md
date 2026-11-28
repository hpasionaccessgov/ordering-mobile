---
slug: hub-app-routing
title: App routing and tab shell
kind: hub
domain: shared
area: shared
status: active
summary: Route table, auth gate and bottom tabs live in one file; every screen path is declared there.
aliases: []
implicit: [all features]
exposed_as: default App component and route paths in src/App.tsx
files:
  - src/App.tsx
  - src/main.tsx
tests:
  - src/App.test.tsx
data: []
config: []
updated: 2026-11-28
---

# App routing and tab shell

## Summary

`App.tsx` owns the router, the four tabs, the protected route group and the startup loading state.
`main.tsx` mounts it under `React.StrictMode`. Adding a screen without declaring a path here makes it
unreachable.

## Contract

- Public: `/login`, `/register`.
- Protected: `/products`, `/products/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/account`,
  `/rewards`, `/favorites`, `/notifications`.
- `/` redirects to `/products`; `/*` renders `ProtectedTabs` inside `RequireAuth`.
- `RequireAuth` shows `LoadingState` until `AuthProvider.ready`, then redirects to `/login`.
- Tabs: Menu (`/products`), Cart, Orders, Account; icons are ionicons named exports.

## Example use

`ProtectedTabs` — see `src/App.tsx`.

## Gotchas

- React Router 6 requires `<Routes>` around `<Route>`; direct children of `IonRouterOutlet` throw at render.
- `IonReactRouter` wraps `BrowserRouter`; `useNavigate`/`useLocation` work inside its tree only.
- `AuthProvider` must stay above `AppRoutes` or `useAuth` throws.
- `AuthProvider.ready` prevents a login-screen flicker on reload.
- `React.StrictMode` double-invokes effects in dev; loaders must tolerate two calls.

## Changelog

- 2026-11-28 (feat, local): customer screens had no routes -> added rewards, favorites and notifications. Test: App
- 2026-11-28 (docs, initial): fixed route table, auth gate and React Router wrapper contract. Test: App
