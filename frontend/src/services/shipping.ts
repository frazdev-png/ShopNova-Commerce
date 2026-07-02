import { authService } from "./auth";
import { api } from "./api";

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address_line: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateShippingAddress {
  full_name: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address_line: string;
  postal_code: string;
  is_default?: boolean;
}

function getToken(): string {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const shippingService = {
  async list(): Promise<ShippingAddress[]> {
    return api.get<ShippingAddress[]>("/addresses", getToken());
  },

  async create(data: CreateShippingAddress): Promise<ShippingAddress> {
    return api.post<ShippingAddress>("/addresses", data, getToken());
  },

  async update(id: string, data: Partial<CreateShippingAddress>): Promise<ShippingAddress> {
    return api.put<ShippingAddress>(`/addresses/${id}`, data, getToken());
  },

  async delete(id: string): Promise<void> {
    await api._delete(`/addresses/${id}`, getToken());
  },
};
