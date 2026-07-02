import { authService } from "./auth";
import { api } from "./api";
import type { Product } from "./product";

interface CreateProduct {
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  category?: string;
}

interface UpdateProduct {
  title?: string;
  description?: string;
  price?: number;
  image_url?: string;
  stock?: number;
  category?: string;
  is_active?: boolean;
}

function getToken(): string {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const adminProductService = {
  async create(data: CreateProduct): Promise<Product> {
    return api.post<Product>("/admin/products", data, getToken());
  },

  async update(id: string, data: UpdateProduct): Promise<Product> {
    return api.put<Product>(`/admin/products/${id}`, data, getToken());
  },

  async delete(id: string): Promise<void> {
    await api._delete(`/admin/products/${id}`, getToken());
  },
};
