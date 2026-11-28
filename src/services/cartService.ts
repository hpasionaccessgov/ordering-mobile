import { request } from './api';
import type { CartSummary } from './types';

export function getCart(): Promise<CartSummary> {
  return request<CartSummary>('/cart');
}

export function addToCart(productId: number, quantity = 1): Promise<CartSummary> {
  return request<CartSummary>('/cart/items', {
    method: 'POST',
    body: { product_id: productId, quantity },
  });
}

export function updateCartItem(productId: number, quantity: number): Promise<CartSummary> {
  return request<CartSummary>(`/cart/items/${productId}`, {
    method: 'PATCH',
    body: { quantity },
  });
}

export function removeCartItem(productId: number): Promise<CartSummary> {
  return request<CartSummary>(`/cart/items/${productId}`, { method: 'DELETE' });
}

export function clearCart(): Promise<CartSummary> {
  return request<CartSummary>('/cart', { method: 'DELETE' });
}
