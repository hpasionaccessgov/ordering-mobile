import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request } from './api';
import { getHighlights } from './catalogService';

vi.mock('./api', () => ({ request: vi.fn(), requestPage: vi.fn() }));

describe('getHighlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads public highlights without a bearer token', async () => {
    const highlights = {
      special_products: [{ id: 7, name: 'Latte', price: '60.00' }],
      featured_products: [],
      best_sellers: [{ product_id: 7, product_name: 'Latte', quantity: 4 }],
    };
    vi.mocked(request).mockResolvedValue(highlights);

    await expect(getHighlights()).resolves.toEqual(highlights);
    expect(request).toHaveBeenCalledWith('/products/highlights', { auth: false });
  });
});
