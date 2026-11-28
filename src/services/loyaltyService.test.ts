import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request, requestPage } from './api';
import { getLoyalty, listRewards, redeemReward, tierProgress } from './loyaltyService';

vi.mock('./api', () => ({ request: vi.fn(), requestPage: vi.fn() }));

describe('loyaltyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps the loyalty summary envelope', async () => {
    vi.mocked(request).mockResolvedValue({
      summary: {
        current: 40,
        lifetimeEarned: 140,
        lifetimeRedeemed: 100,
        tier: 'silver',
        tier_label: 'Silver',
      },
    });

    await expect(getLoyalty()).resolves.toMatchObject({ current: 40, tier: 'silver' });
    expect(request).toHaveBeenCalledWith('/loyalty');
  });

  it('computes tier progress with the web thresholds', () => {
    expect(tierProgress(50)).toEqual({ percent: 50, remaining: 50, nextTier: 'Silver' });
    expect(tierProgress(140)).toEqual({ percent: 10, remaining: 360, nextTier: 'Gold' });
    expect(tierProgress(500)).toEqual({ percent: 100, remaining: 0, nextTier: 'Gold' });
  });

  it('posts a redemption and reads paginated rewards', async () => {
    vi.mocked(request).mockResolvedValue({ id: 1, points: -50, order_number: 'CB-1' });
    vi.mocked(requestPage).mockResolvedValue({ items: [], pagination: undefined });

    await redeemReward(3);
    await listRewards(1);

    expect(request).toHaveBeenCalledWith('/rewards/3/redeem', { method: 'POST' });
    expect(requestPage).toHaveBeenCalledWith('/rewards?page=1');
  });
});
