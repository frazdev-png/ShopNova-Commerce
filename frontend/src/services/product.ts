import { api } from "./api";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const productService = {
  async list(params?: {
    category?: string;
    search?: string;
    sort_by?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.page) q.set("page", String(params.page));
    if (params?.per_page) q.set("per_page", String(params.per_page));
    const query = q.toString() ? `?${q}` : "";
    const res = await api.get<{
      items: Product[];
      total: number;
      page: number;
      per_page: number;
    }>(`/products${query}`);
    return {
      items: res.items,
      total: res.total,
      page: res.page,
      per_page: res.per_page,
      total_pages: Math.ceil(res.total / res.per_page),
    };
  },

  async get(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  },
};
