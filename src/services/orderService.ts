import { request, requestPage } from './api';
import type { Page } from './api';
import type { Order, PaginationMeta } from './types';

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export async function listOrders(page = 0): Promise<{ orders: Order[]; pagination?: PaginationMeta }> {
  const result: Page<Order[]> = await requestPage<Order[]>(`/orders?page=${page}`);
  return { orders: result.items, pagination: result.pagination };
}

export function getOrder(id: number): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export function placeOrder(items: OrderItemInput[]): Promise<Order> {
  return request<Order>('/orders', { method: 'POST', body: { items } });
}

export function cancelOrder(id: number): Promise<Order> {
  return request<Order>(`/orders/${id}/cancel`, { method: 'POST' });
}
