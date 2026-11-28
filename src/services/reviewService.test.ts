import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request } from './api';
import { createReview, getReviews } from './reviewService';

vi.mock('./api', () => ({ request: vi.fn(), requestPage: vi.fn() }));

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries reviews by product id and posts a review', async () => {
    vi.mocked(request).mockResolvedValue({
      product_id: 7,
      reviews: [],
      summary: { average: 0, count: 0 },
      eligible_orders: [{ id: 9, order_number: 'CB-9' }],
    });
    await expect(getReviews(7)).resolves.toMatchObject({ product_id: 7 });
    expect(request).toHaveBeenCalledWith('/reviews?product_id=7');

    vi.mocked(request).mockResolvedValue({ id: 1, rating: 5, review: 'Great', created_at: 1 });
    await createReview({ product_id: 7, order_id: 9, rating: 5, review: 'Great' });
    expect(request).toHaveBeenCalledWith('/reviews', {
      method: 'POST',
      body: { product_id: 7, order_id: 9, rating: 5, review: 'Great' },
    });
  });
});
