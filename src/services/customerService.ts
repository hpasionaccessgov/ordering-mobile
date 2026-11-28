import { request } from './api';
import type { CustomerSummary } from './types';

export function getCustomerSummary(): Promise<CustomerSummary> {
  return request<CustomerSummary>('/customer/summary');
}
