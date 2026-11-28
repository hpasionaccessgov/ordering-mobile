import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request } from './api';
import { addFavorite, isFavorite, removeFavorite } from './favoriteService';

vi.mock('./api', () => ({ request: vi.fn(), requestPage: vi.fn() }));

describe('favoriteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds and removes by product id', async () => {
    vi.mocked(request).mockResolvedValue({ product_id: 7, added: true });
    await addFavorite(7);
    expect(request).toHaveBeenCalledWith('/favorites', { method: 'POST', body: { product_id: 7 } });

    vi.mocked(request).mockResolvedValue({ product_id: 7, removed: true });
    await removeFavorite(7);
    expect(request).toHaveBeenCalledWith('/favorites/7', { method: 'DELETE' });
  });

  it('detects a saved product id', () => {
    expect(isFavorite([{ id: 1, product_id: 7, product: null }], 7)).toBe(true);
    expect(isFavorite([], 7)).toBe(false);
  });
});
