import { request } from './api';
import type { Review, ReviewInput, ReviewList } from './types';

export function getReviews(productId: number): Promise<ReviewList> {
  return request<ReviewList>(`/reviews?product_id=${productId}`);
}

export function createReview(input: ReviewInput): Promise<Review> {
  return request<Review>('/reviews', { method: 'POST', body: input });
}
