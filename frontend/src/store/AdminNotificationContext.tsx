import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authService } from "../services/auth";
import { adminNotificationService, type NotificationItem } from "../services/adminNotification";
import { useToast } from "./ToastContext";

interface UnreadCounts {
  total: number;
  orders: number;
  customers: number;
  chats: number;
}

interface AdminNotificationContextType {
  notifications: NotificationItem[];
  unread: UnreadCounts;
  loading: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | null>(null);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState<UnreadCounts>({ total: 0, orders: 0, customers: 0, chats: 0 });

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await adminNotificationService.list(1, 20);
      if (!mountedRef.current) return;
      setNotifications(r.items);
      const orders = r.items.filter((n) => !n.is_read && n.notification_type === "new_order").length;
      const customers = r.items.filter((n) => !n.is_read && n.notification_type === "new_customer").length;
      const chats = r.items.filter((n) => !n.is_read && n.notification_type === "new_chat_message").length;
      setUnread({ total: r.unread_count, orders, customers, chats });
    } catch {
      // ignore
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const toastRef = useRef(toast);
  toastRef.current = toast;
  const fetchRef = useRef(fetchNotifications);
  fetchRef.current = fetchNotifications;

  const connectWs = useCallback(() => {
    const token = authService.getToken();
    if (!token) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = adminNotificationService.connectWebSocket();
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        fetchRef.current();

        if (msg.type === "new_order") {
          toastRef.current.showToast(`New order from ${msg.data.customer_name} — $${msg.data.total}`, "info");
        } else if (msg.type === "new_customer") {
          toastRef.current.showToast(`New customer: ${msg.data.name} (${msg.data.email})`, "info");
        } else if (msg.type === "new_chat_message") {
          toastRef.current.showToast(`New message from ${msg.data.customer_name}`, "info");
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!mountedRef.current) return;
      const gen = generationRef.current;
      reconnectTimer.current = setTimeout(() => {
        if (mountedRef.current && gen === generationRef.current) {
          connectWs();
        }
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    generationRef.current += 1;
    mountedRef.current = true;
    fetchNotifications();
    connectWs();
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = undefined;
      }
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.onopen = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        wsRef.current = null;
      }
    };
  }, [fetchNotifications, connectWs]);

  const markAllRead = useCallback(async () => {
    await adminNotificationService.markAllRead();
    setUnread({ total: 0, orders: 0, customers: 0, chats: 0 });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const markRead = useCallback(async (id: string) => {
    await adminNotificationService.markRead(id);
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      const total = updated.filter((n) => !n.is_read).length;
      const orders = updated.filter((n) => !n.is_read && n.notification_type === "new_order").length;
      const customers = updated.filter((n) => !n.is_read && n.notification_type === "new_customer").length;
      const chats = updated.filter((n) => !n.is_read && n.notification_type === "new_chat_message").length;
      setUnread({ total, orders, customers, chats });
      return updated;
    });
  }, []);

  return (
    <AdminNotificationContext.Provider value={{ notifications, unread, loading, open, setOpen, fetchNotifications, markAllRead, markRead }}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) throw new Error("useAdminNotifications must be inside AdminNotificationProvider");
  return ctx;
}
