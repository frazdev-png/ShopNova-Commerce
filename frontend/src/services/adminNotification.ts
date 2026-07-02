import { authService } from "./auth";
import { api } from "./api";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unread_count: number;
}

function getToken(): string {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const adminNotificationService = {
  async list(page: number = 1, per_page: number = 20): Promise<NotificationListResponse> {
    return api.get<NotificationListResponse>(`/admin/notifications?page=${page}&per_page=${per_page}`, getToken());
  },

  async markAllRead(): Promise<void> {
    await api.put("/admin/notifications/read-all", {}, getToken());
  },

  async markRead(id: string): Promise<void> {
    await api.put(`/admin/notifications/${id}/read`, {}, getToken());
  },

  getWsUrl(): string {
    const token = authService.getToken();
    if (!token) throw new Error("Not authenticated");
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    return `${wsUrl}/api/admin/notifications/ws?token=${token}`;
  },

  connectWebSocket(): WebSocket {
    const ws = new WebSocket(this.getWsUrl());
    return ws;
  },
};
