---
slug: hub-api-client
title: API client wrapper
kind: hub
domain: shared
area: shared
status: active
summary: One fetch wrapper adds bearer tokens, unwraps the success envelope and normalizes errors.
aliases: []
implicit: [all features]
exposed_as: named imports from src/services/api.ts
files:
  - src/services/api.ts
  - src/services/types.ts
tests:
  - src/App.test.tsx
data: []
config: [VITE_API_BASE_URL]
updated: 2026-11-28
---

# API client wrapper

## Summary

Every service call goes through `request` or `requestPage`. The wrapper resolves the base URL, adds
the bearer token from native preferences, unwraps `{success,data,meta}` and throws `ApiError`.
Changing it affects every feature; a mistake here breaks auth, catalog, cart and orders at once.

## Contract

- `API_BASE_URL`: `VITE_API_BASE_URL` or native/web fallback, trailing slash removed.
- `request<T>(path, options)` → `T`; `requestPage<T>(path, options)` → `{items, pagination}`.
- `options`: `method` (GET default), `body` (object, JSON-encoded), `auth` (default true).
- `ApiError(status, code, message, errors)`; `firstError(error)` prefers the first field error.
- On 401 with `auth !== false`: remove token, dispatch `cafebara:unauthorized`, then throw.

## Example use

`listProducts` — see `src/services/catalogService.ts`.

## Gotchas

- `auth: false` suppresses both the Authorization header and the 401 cleanup.
- Network failures become `ApiError(0, 'network_error', ...)`; non-JSON responses become `invalid_response`.
- `data === undefined` is treated as an error, so an empty body can never be a valid success.
- Android emulator uses `10.0.2.2`; physical devices need `VITE_API_BASE_URL` set to a LAN URL.
- List `page` is zero-based; `meta.pagination.current_page` is one-based.
- Prices are decimal strings; `OrderStatus` values come from `src/services/types.ts`.

## Changelog

- 2026-11-28 (docs, initial): recorded envelope, 401 event and base URL resolution. Test: request
