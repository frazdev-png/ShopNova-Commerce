import { api } from "./api";
import { authService } from "./auth";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

async function getToken(): Promise<string> {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const categoryService = {
  async listActive(): Promise<Category[]> {
    return api.get<Category[]>("/categories/active");
  },

  async listAll(): Promise<Category[]> {
    return api.get<Category[]>("/categories", await getToken());
  },

  async create(data: { name: string; description?: string }): Promise<Category> {
    return api.post<Category>("/categories", data, await getToken());
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data, await getToken());
  },

  async delete(id: string): Promise<void> {
    await api._delete(`/categories/${id}`, await getToken());
  },
};
