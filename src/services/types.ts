export interface PaginationMeta {
  total: number;
  page_count: number;
  current_page: number;
  per_page: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  status: number;
}

export interface AuthTokens {
  token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface RegisterPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category_id: number | null;
  is_featured: boolean | number;
  is_special: boolean | number;
  status: number;
  image_url: string | null;
}

export interface BestSeller {
  product_id: number;
  product_name: string;
  quantity: number;
}

export interface ProductHighlights {
  special_products: Product[];
  featured_products: Product[];
  best_sellers: BestSeller[];
}

export interface CartLine {
  product: Pick<Product, 'id' | 'name' | 'price'>;
  quantity: number;
  subtotal: string;
}

export interface CartSummary {
  lines: CartLine[];
  total: string;
  count: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: string;
  created_at: number;
  updated_at: number;
  confirmed_at: number | null;
  processing_at: number | null;
  ready_at: number | null;
  completed_at: number | null;
  items: OrderItem[];
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_pickup: 'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export interface CustomerSummary {
  order_count: number;
  total_spent: string;
  favorite_count: number;
  favorite_product: Pick<Product, 'id' | 'name' | 'price'> | null;
}

export interface LoyaltySummary {
  current: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tier: string;
  tier_label: string;
}

export interface LoyaltyTransaction {
  id: number;
  order_id: number | null;
  points: number;
  transaction_type: string;
  remarks: string | null;
  created_at: number;
  typeLabel: string;
}

export interface RedeemedReward extends LoyaltyTransaction {
  order_number: string | null;
}

export interface Reward {
  id: number;
  name: string;
  description: string | null;
  point_cost: number;
  product_id: number;
  product_name: string | null;
}

export interface AppNotification {
  id: number;
  type: string;
  status: number;
  message: string;
  target_route: string | null;
  target_id: number | null;
  category: string;
  created_at: number;
  read_at: number | null;
  label: string;
  categoryLabel: string;
  targetUrl: string | null;
}

export interface Favorite {
  id: number;
  product_id: number;
  product: Pick<Product, 'id' | 'name' | 'price'> | null;
}

export interface Review {
  id: number;
  rating: number;
  review: string;
  created_at: number;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface EligibleOrder {
  id: number;
  order_number: string;
}

export interface ReviewList {
  product_id: number;
  reviews: Review[];
  summary: ReviewSummary;
  eligible_orders: EligibleOrder[];
}

export interface ReviewInput {
  product_id: number;
  order_id: number;
  rating: number;
  review: string;
}
