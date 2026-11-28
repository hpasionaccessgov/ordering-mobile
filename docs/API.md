# Backend API used by the mobile app

Mobile consumes the same Cafébara REST API as the web app. Business rules, pricing and order state
transitions stay on the server. Canonical backend doc: `ordering_system/docs/API.md`.

## Base URL

`src/services/api.ts` resolves, in order:

1. `VITE_API_BASE_URL` (build-time env var)
2. native: `http://10.0.2.2:8080/api` (Android emulator → host loopback)
3. web: `http://localhost:8080/api`

Android uses `androidScheme: 'http'` and `usesCleartextTraffic="true"` for local HTTP. A physical
device needs `VITE_API_BASE_URL` set to a reachable LAN address; `10.0.2.2` only works in the emulator.

## Envelope

`ionic serve` runs on `http://localhost:8100` (Vite dev server); `npm run dev` uses `http://localhost:5173`.
Both origins are allowlisted by the backend CORS filter. Add any other browser origin to
`API_CORS_ORIGINS` in `ordering_system/.env` or the browser fetch will be blocked.

Success: `{"success":true,"data":...,"meta":{"pagination":{...}}}`.
Failure: `{"success":false,"error":{"code":"validation_failed","message":"...","errors":{"field":["..."]}}}`.
`src/services/api.ts` throws `ApiError(status, code, message, errors)`; `firstError()` prefers the
first field error for display.

`GET` list endpoints take zero-based `page`; `meta.pagination.current_page` is one-based. Per-page is
clamped by the backend (currently 9), so do not assume a custom page size is honoured.

## Endpoints the app calls

| Method | Path | Auth | Used by |
|---|---|---|---|
| POST | `/register` | public | `authService.register` |
| POST | `/login` | public | `authService.login` |
| GET | `/profile` | bearer | `authService.profile` |
| POST | `/logout` | bearer | `authService.logout` |
| GET | `/products?page={n}` | public | `catalogService.listProducts` |
| GET | `/products/{id}` | public | `catalogService.getProduct` |
| GET | `/cart` | bearer | `cartService.getCart` |
| POST | `/cart/items` | bearer | `cartService.addToCart` |
| PATCH | `/cart/items/{id}` | bearer | `cartService.updateCartItem` |
| DELETE | `/cart/items/{id}` | bearer | `cartService.removeCartItem` |
| DELETE | `/cart` | bearer | `cartService.clearCart` |
| POST | `/orders` | bearer | `orderService.placeOrder` |
| GET | `/orders?page={n}` | bearer | `orderService.listOrders` |
| GET | `/orders/{id}` | bearer | `orderService.getOrder` |
| POST | `/orders/{id}/cancel` | bearer | `orderService.cancelOrder` |

## Payloads

- Register: `{username, email, fullName, password, passwordConfirm}` → same token payload as login.
- Login: `{username, password}` → `{token, token_type, expires_in, expires_at}`; `expires_in` is seconds (86400).
- Logout: → `{revoked:true}`; the server revokes the presented token.
- Order create: `{items:[{product_id, quantity}]}` → full `Order` with items and server-computed total.
- Cart add/update: `{product_id, quantity}` / `{quantity}` → `{lines, total, count}`.

Types mirroring these shapes live in `src/services/types.ts`: `UserProfile`, `AuthTokens`,
`RegisterPayload`, `Product`, `CartSummary`, `Order`, `OrderItem`, `PaginationMeta`, `OrderStatus`.

## Order status values

`pending`, `confirmed`, `processing`, `ready_for_pickup`, `completed`, `cancelled`. Labels are in
`STATUS_LABELS` (`src/services/types.ts`). `OrderDetail` polls `GET /orders/{id}` every 20 s so an
admin status change in the web app appears without a manual reload.

## Smoke check

```bash
curl -sS http://localhost:8080/api/products?page=0
curl -sS -X POST http://localhost:8080/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"secret"}'
curl -sS http://localhost:8080/api/cart -H 'Authorization: Bearer REPLACE_WITH_TOKEN'
```
