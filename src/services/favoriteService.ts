import { request, requestPage } from './api';
import type { Page } from './api';
import type { Favorite, PaginationMeta } from './types';

export async function listFavorites(page = 0): Promise<{ favorites: Favorite[]; pagination?: PaginationMeta }> {
  const result: Page<Favorite[]> = await requestPage<Favorite[]>(`/favorites?page=${page}`);
  return { favorites: result.items, pagination: result.pagination };
}

export function addFavorite(productId: number): Promise<{ product_id: number; added: boolean }> {
  return request<{ product_id: number; added: boolean }>('/favorites', {
    method: 'POST',
    body: { product_id: productId },
  });
}

export function removeFavorite(productId: number): Promise<{ product_id: number; removed: boolean }> {
  return request<{ product_id: number; removed: boolean }>(`/favorites/${productId}`, { method: 'DELETE' });
}

export function isFavorite(favorites: Favorite[], productId: number): boolean {
  return favorites.some((favorite) => favorite.product_id === productId);
}
