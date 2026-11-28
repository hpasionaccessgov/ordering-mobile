import { request, requestPage } from './api';
import type { Page } from './api';
import type { LoyaltySummary, LoyaltyTransaction, PaginationMeta, RedeemedReward, Reward } from './types';

interface LoyaltyEnvelope {
  summary: LoyaltySummary;
}

export interface TierProgress {
  percent: number;
  remaining: number;
  nextTier: string;
}

export async function getLoyalty(): Promise<LoyaltySummary> {
  const result = await request<LoyaltyEnvelope>('/loyalty');
  return result.summary;
}

export function tierProgress(lifetimeEarned: number): TierProgress {
  if (lifetimeEarned >= 500) {
    return { percent: 100, remaining: 0, nextTier: 'Gold' };
  }
  if (lifetimeEarned >= 100) {
    return {
      percent: Math.round(((lifetimeEarned - 100) / 400) * 100),
      remaining: 500 - lifetimeEarned,
      nextTier: 'Gold',
    };
  }
  return {
    percent: Math.round((lifetimeEarned / 100) * 100),
    remaining: 100 - lifetimeEarned,
    nextTier: 'Silver',
  };
}

export async function listTransactions(
  page = 0,
): Promise<{ transactions: LoyaltyTransaction[]; pagination?: PaginationMeta }> {
  const result: Page<LoyaltyTransaction[]> = await requestPage<LoyaltyTransaction[]>(
    `/loyalty/transactions?page=${page}`,
  );
  return { transactions: result.items, pagination: result.pagination };
}

export async function listRewards(page = 0): Promise<{ rewards: Reward[]; pagination?: PaginationMeta }> {
  const result: Page<Reward[]> = await requestPage<Reward[]>(`/rewards?page=${page}`);
  return { rewards: result.items, pagination: result.pagination };
}

export function redeemReward(id: number): Promise<RedeemedReward> {
  return request<RedeemedReward>(`/rewards/${id}/redeem`, { method: 'POST' });
}
