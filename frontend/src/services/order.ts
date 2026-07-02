import { authService } from "./auth";
import { api } from "./api";

export interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  price_snapshot: number;
}

export interface Order {
  id: string;
  user_id: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total_price: number;
  payment_method: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateOrderPayload {
  shipping_address_id: string;
  payment_method: string;
  notes?: string;
}

function getToken(): string {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    return api.post<Order>("/orders/create", payload, getToken());
  },

  async get(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`, getToken());
  },

  async my(page: number = 1, per_page: number = 10): Promise<OrderListResponse> {
    return api.get<OrderListResponse>(`/orders/my?page=${page}&per_page=${per_page}`, getToken());
  },

  async all(page: number = 1, per_page: number = 20): Promise<OrderListResponse> {
    return api.get<OrderListResponse>(`/orders/all?page=${page}&per_page=${per_page}`, getToken());
  },

  async updateStatus(order_id: string, status: string): Promise<Order> {
    return api.put<Order>(`/orders/status/${order_id}`, { status }, getToken());
  },
};
