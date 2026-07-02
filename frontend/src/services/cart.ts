import { authService } from "./auth";
import { api } from "./api";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  title: string;
  price: number;
  image_url: string | null;
  stock: number;
  created_at: string;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

function getToken(): string {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const cartService = {
  async get(): Promise<CartResponse> {
    return api.get<CartResponse>("/cart", getToken());
  },

  async add(product_id: string, quantity: number = 1): Promise<CartItem> {
    return api.post<CartItem>("/cart/add", { product_id, quantity }, getToken());
  },

  async update(item_id: string, quantity: number): Promise<CartItem> {
    return api.put<CartItem>(`/cart/update/${item_id}`, { quantity }, getToken());
  },

  async remove(item_id: string): Promise<void> {
    await api._delete(`/cart/remove/${item_id}`, getToken());
  },
};
