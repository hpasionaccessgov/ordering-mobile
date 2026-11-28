---
slug: auth-session
title: Authentication session
kind: feature
domain: auth
status: draft
summary: Login, registration and logout persist a bearer token and gate the protected screens.
aliases: []
entry:
  - screen /login
  - screen /register
  - event cafebara:unauthorized
files:
  - src/pages/Login.tsx
  - src/pages/Register.tsx
  - src/pages/Account.tsx
  - src/context/AuthContext.tsx
tests:
  - src/App.test.tsx
data: [cafebara.auth.token]
config: []
connections: []
hubs:
  - hub-api-client: token header, 401 cleanup and error text all come from request()
  - hub-app-routing: RequireAuth wraps ProtectedTabs and redirects to /login
  - hub-ui-components: all three screens use AppHeader and StateViews
updated: 2026-11-28
---

# Authentication session

## Summary

Customers sign in or create an account and receive a bearer token. Token survives reloads via native
preferences; protected screens redirect to `/login` when the session is gone. Account screen shows the
profile and performs logout.

## Example use

```bash
# http://localhost:5173/register -> submit -> http://localhost:5173/products
npm run test:unit -- src/App.test.tsx
```

Backend equivalents: `POST /api/register`, `POST /api/login`, `GET /api/profile`, `POST /api/logout`.

## Entry points

| Entry | Handler | Kind / access | Note |
|---|---|---|---|
| `/login` | `Login` | screen, public | Redirects to `/products` when `user` already set |
| `/register` | `Register` | screen, public | Same redirect; posts `RegisterPayload` |
| `cafebara:unauthorized` | `AuthProvider` listener | event | Fired by `request()` on 401; clears `user` |
| `-> hub-app-routing` | `RequireAuth` | inherited | Gate for every other screen |

## Chain

- Entry: `Login`, `Register`, `Account` in `src/pages/`.
- Logic: `useAuth` → `signIn`, `signUp`, `signOut` in `AuthContext`; `authService` functions; `tokenStorage`.
- Data: `cafebara.auth.token` in Capacitor Preferences; `UserProfile` from `GET /profile`.
- Presentation: `AppHeader`, `IonItem`/`IonInput` fields, `useIonToast` for errors.
- Config: `VITE_API_BASE_URL` via `hub-api-client`.

## Flow

1. `Login.submit` validates non-empty username/password, sets `busy`.
2. `useAuth.signIn` calls `authService.login`, then `setToken` and `authService.profile`.
3. `AuthProvider` stores `UserProfile`; `Login` navigates to `/products`.
4. On reload, `AuthProvider` effect calls `getToken` then `authService.profile`.
5. Failed profile clears token; `ready` becomes true either way.
6. `Register.submit` sends camelCase fields via `useAuth.signUp`; same token path.
7. `Account.logout` calls `useAuth.signOut` → `authService.logout`, then removes token and user.
8. `request()` removes the token and emits `cafebara:unauthorized` on any 401; listener clears user.

## Gotchas

- `expires_in` is advisory only; no client-side expiry timer exists.
- `signOut` clears local state even when the revoke call fails (try/finally).
- `RegisterPayload` uses camelCase field names; backend form rules expect exactly those names.
- `ready` gates `RequireAuth`; rendering protected screens before it causes a login flicker.
- The unauthorized event listener is removed on unmount; it is registered inside `AuthProvider`.

## Tests

`npm run test:unit -- src/App.test.tsx` only proves the shell renders. No dedicated test covers token
persistence, 401 cleanup or the register payload yet — add `src/context/AuthContext.test.tsx`.

## Changelog

- 2026-11-28 (docs, initial): captured auth flow and 401 event contract. Test: AuthProvider
