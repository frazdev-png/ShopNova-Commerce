import { authService } from "./auth";
import { api } from "./api";

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  active_products: number;
  pending_orders: number;
}

async function getToken(): Promise<string> {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const adminDashboardService = {
  async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>("/admin/dashboard/stats", await getToken());
  },
};
