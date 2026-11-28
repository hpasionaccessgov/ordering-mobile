import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request, requestPage } from './api';
import { listNotifications, markRead, removeNotification, unreadCount } from './notificationService';

vi.mock('./api', () => ({ request: vi.fn(), requestPage: vi.fn() }));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the unread count and paginated inbox', async () => {
    vi.mocked(request).mockResolvedValue({ count: 3 });
    await expect(unreadCount()).resolves.toBe(3);
    expect(request).toHaveBeenCalledWith('/notifications/unread-count');

    vi.mocked(requestPage).mockResolvedValue({ items: [], pagination: undefined });
    await listNotifications(2);
    expect(requestPage).toHaveBeenCalledWith('/notifications?page=2');
  });

  it('marks read and deletes by notification id', async () => {
    vi.mocked(request).mockResolvedValue({ id: 4, read_at: 123 });
    await markRead(4);
    expect(request).toHaveBeenCalledWith('/notifications/4/read', { method: 'POST' });

    vi.mocked(request).mockResolvedValue({ deleted: true });
    await removeNotification(4);
    expect(request).toHaveBeenCalledWith('/notifications/4', { method: 'DELETE' });
  });
});
