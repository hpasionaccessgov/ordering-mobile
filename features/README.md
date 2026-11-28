# Feature Map — Cafébara mobile (index)

Connections only. Each row is `features/<slug>.md`. Read this file first, then open ONLY the feature
file(s) for your task (at most 3), then the source files they list. `links` = features this one
depends on or feeds; the reason for each link, entry points, flow, tests and gotchas live in the file.
- Who links TO a feature:    grep -l "^  - <slug>:" features/*.md
- Which feature owns a path: grep -l "<path>" features/*.md
- Changing a feature? Follow AGENTS.md § Feature map. Format and caps: features/_guide.md.

## auth
| slug | summary | links |
|---|---|---|
| auth-session | Login, registration and logout persist a bearer token and gate the protected screens. | |

## catalog
| slug | summary | links |
|---|---|---|
| catalog-browse | Menu and detail load the active Cafébara catalog, with heart and review controls. | cart-manage, favorites-manage, reviews-rate |
| menu-highlights | Menu shows today's specials, featured items and ranked best sellers above the full list. | catalog-browse, hub-best-sellers |

## cart
| slug | summary | links |
|---|---|---|
| cart-manage | Cart screen loads server-side lines and changes quantities through the REST cart service. | catalog-browse, checkout |

## orders
| slug | summary | links |
|---|---|---|
| checkout | Review cart, place an order from explicit items, clear the cart and open the new order. | cart-manage, order-tracking |
| order-tracking | Order list and detail show server status with a timeline, pull refresh and timed polling. | checkout |

## account
| slug | summary | links |
|---|---|---|
| customer-dashboard | Account screen shows spend, favorites and loyalty KPIs with quick links to customer services. | loyalty-rewards, favorites-manage, notifications-inbox |
| favorites-manage | Favorites screen and product heart let customers save products and remove saved ones. | catalog-browse, customer-dashboard |
| loyalty-rewards | Rewards screen shows tier progress and points, redeems treats and lists the loyalty ledger. | customer-dashboard, order-tracking |
| notifications-inbox | Inbox lists customer notifications with unread count, mark-read and delete actions. | customer-dashboard |
| reviews-rate | Product detail shows ratings and lets customers review products from completed orders. | catalog-browse, order-tracking |

## shared (hubs)
| slug | file | contract |
|---|---|---|
| hub-api-client | features/hub-api-client.md | One fetch wrapper adds bearer tokens, unwraps the success envelope and normalizes errors. |
| hub-app-routing | features/hub-app-routing.md | Route table, auth gate and bottom tabs live in one file; every screen path is declared there. |
| hub-theme | features/hub-theme.md | Ionic tokens, brand logo, Android icons and cafebara-* classes mirror the web look. |
| hub-ui-components | features/hub-ui-components.md | Shared header, state views, product card and status badge give every screen one visual contract. |

## Aliases
