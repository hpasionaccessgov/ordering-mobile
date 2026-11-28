import { request, requestPage } from './api';
import type { Page } from './api';
import type { PaginationMeta, Product, ProductHighlights } from './types';

export async function listProducts(page = 0): Promise<{ products: Product[]; pagination?: PaginationMeta }> {
  const result: Page<Product[]> = await requestPage<Product[]>(`/products?page=${page}`, { auth: false });
  return { products: result.items, pagination: result.pagination };
}

export function getHighlights(): Promise<ProductHighlights> {
  return request<ProductHighlights>('/products/highlights', { auth: false });
}

export function getProduct(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`, { auth: false });
}
