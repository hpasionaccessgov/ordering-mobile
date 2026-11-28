import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request } from './api';
import { getCustomerSummary } from './customerService';

vi.mock('./api', () => ({ request: vi.fn(), requestPage: vi.fn() }));

describe('getCustomerSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the customer summary endpoint', async () => {
    vi.mocked(request).mockResolvedValue({
      order_count: 2,
      total_spent: '120.00',
      favorite_count: 1,
      favorite_product: { id: 7, name: 'Latte', price: '60.00' },
    });

    await expect(getCustomerSummary()).resolves.toMatchObject({ order_count: 2, total_spent: '120.00' });
    expect(request).toHaveBeenCalledWith('/customer/summary');
  });
});
