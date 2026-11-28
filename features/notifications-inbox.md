---
slug: notifications-inbox
title: Notifications inbox
kind: feature
domain: account
status: active
summary: Inbox lists customer notifications with unread count, mark-read and delete actions.
aliases: []
entry:
  - screen /notifications
files:
  - src/pages/Notifications.tsx
  - src/services/notificationService.ts
tests:
  - src/services/notificationService.test.ts
data: [notifications]
config: []
connections:
  - customer-dashboard: dashboard links to the inbox and shows the unread count.
hubs:
  - hub-api-client: inbox calls use request and requestPage.
  - hub-ui-components: StateViews covers loading, error and empty states.
  - hub-app-routing: /notifications is a protected route.
updated: 2026-11-28
---

# Notifications inbox

## Summary

A customer-only inbox built on the existing notification API. Rows are scoped to the token owner;
opening one marks it read and deleting one removes it. Pull-to-refresh reloads the list.

## Example use

http://localhost:8100/notifications

`npm run test:unit -- src/services/notificationService.test.ts`

## Entry points

| Entry | Handler (Symbol) | Kind / access | Note |
|---|---|---|---|
| screen /notifications | `Notifications` | bearer | Protected route linked from Account. |

## Chain

- entry: `src/App.tsx` renders `Notifications` on `/notifications`.
- logic: `listNotifications`, `unreadCount`, `markRead`, `removeNotification`.
- data: `/api/notifications`, `/api/notifications/unread-count`, `/api/notifications/{id}`.
- presentation: read/unread rows with Ionic buttons; `StateViews` for states.
- config: none beyond the API base URL.

## Flow

1. `Notifications` calls `load()` on enter to fetch the list and unread count.
2. `IonRefresher` calls the same loader and completes the refresh.
3. Tapping an unread row calls `markRead(id)` and updates that row.
4. The delete button calls `removeNotification(id)` then reloads.
5. Errors surface as a danger toast through `firstError`.

## Gotchas

- The API's `targetUrl` is a web route; mobile navigation uses `target_route` and never `window.location`.
- `read_at` is a Unix timestamp or null; rows with a value are already read.
- Delete is visible on every row; the backend still enforces ownership.

## Tests

`src/services/notificationService.test.ts` asserts list, read and delete calls.

## Changelog

- 2026-11-28 (feat, local): mobile had no notification surface -> added owner-scoped inbox. Test: listNotifications
