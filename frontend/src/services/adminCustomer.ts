import { authService } from "./auth";
import { api } from "./api";

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  order_count: number;
  total_spent: number;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
}

async function getToken(): Promise<string> {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const adminCustomerService = {
  async list(): Promise<CustomerListResponse> {
    return api.get<CustomerListResponse>("/admin/customers", await getToken());
  },

  async get(id: string): Promise<Customer> {
    return api.get<Customer>(`/admin/customers/${id}`, await getToken());
  },

  async updateStatus(id: string, is_active: boolean): Promise<Customer> {
    return api.put<Customer>(`/admin/customers/${id}/status`, { is_active }, await getToken());
  },
};
