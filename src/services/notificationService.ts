import { request, requestPage } from './api';
import type { Page } from './api';
import type { AppNotification, PaginationMeta } from './types';

export async function listNotifications(
  page = 0,
): Promise<{ notifications: AppNotification[]; pagination?: PaginationMeta }> {
  const result: Page<AppNotification[]> = await requestPage<AppNotification[]>(`/notifications?page=${page}`);
  return { notifications: result.items, pagination: result.pagination };
}

export async function unreadCount(): Promise<number> {
  const result = await request<{ count: number }>('/notifications/unread-count');
  return result.count;
}

export function markRead(id: number): Promise<AppNotification> {
  return request<AppNotification>(`/notifications/${id}/read`, { method: 'POST' });
}

export function removeNotification(id: number): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(`/notifications/${id}`, { method: 'DELETE' });
}
