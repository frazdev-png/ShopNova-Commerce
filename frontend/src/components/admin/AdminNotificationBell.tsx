import { useEffect, useRef } from "react";
import { useAdminNotifications } from "../../store";
import type { NotificationItem } from "../../services/adminNotification";

interface Props {
  align?: "left" | "right";
}

export default function AdminNotificationBell({ align = "right" }: Props) {
  const { notifications, unread, loading, open, setOpen, markAllRead, markRead } = useAdminNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const markDoneRef = useRef(false);

  // Auto-mark all as read when dropdown opens
  useEffect(() => {
    if (open && unread.total > 0 && !markDoneRef.current) {
      markDoneRef.current = true;
      markAllRead();
    }
    if (!open) {
      markDoneRef.current = false;
    }
  }, [open, unread.total, markAllRead]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread.total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unread.total > 9 ? "9+" : unread.total}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] ${
          align === "left" ? "left-0" : "right-0"
        }`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
            ) : (
              notifications.map((n: NotificationItem) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 ${!n.is_read ? "bg-primary-50/50 dark:bg-primary-900/10" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <div className="w-2 h-2 mt-1.5 bg-primary-500 rounded-full flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
