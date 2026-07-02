import { api } from "./api";
import { authService } from "./auth";

const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export interface ChatSession {
  id: string;
  user_id: string;
  admin_id: string | null;
  created_at: string;
  last_message: string | null;
  last_timestamp: string | null;
  customer_name?: string | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

export interface MessageListResponse {
  items: Message[];
  total: number;
  page: number;
  per_page: number;
}

export const chatService = {
  async startChat(): Promise<ChatSession> {
    const token = authService.getToken()!;
    return api.post<ChatSession>("/chat/start", {}, token);
  },

  async getMyChats(): Promise<ChatSession[]> {
    const token = authService.getToken()!;
    return api.get<ChatSession[]>("/chat/my", token);
  },

  async getAllChats(): Promise<ChatSession[]> {
    const token = authService.getToken()!;
    return api.get<ChatSession[]>("/chat/all", token);
  },

  async getMessages(chatId: string, page = 1, perPage = 50): Promise<MessageListResponse> {
    const token = authService.getToken()!;
    return api.get<MessageListResponse>(
      `/chat/${chatId}/messages?page=${page}&per_page=${perPage}`,
      token,
    );
  },

  async markRead(chatId: string): Promise<{ marked: number }> {
    const token = authService.getToken()!;
    return api.patch<{ ok: boolean; marked: number }>(`/chat/${chatId}/mark-read`, {}, token);
  },

  connectWebSocket(chatId: string): WebSocket {
    const token = authService.getToken()!;
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${chatId}?token=${token}`);

    ws.onerror = () => {};

    return ws;
  },
};
