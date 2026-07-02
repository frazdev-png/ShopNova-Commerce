import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { chatService, type ChatSession } from "../../services/chat";
import { useAdminNotifications } from "../../store/AdminNotificationContext";
import { formatTime } from "../../utils/time";

export default function AdminChatList() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchNotifications } = useAdminNotifications();

  const loadChats = useCallback(async () => {
    try {
      const data = await chatService.getAllChats();
      setChats(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 8000);
    return () => clearInterval(interval);
  }, [loadChats]);

  const handleChatClick = () => {
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Chats</h1>

      {chats.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">No customer chats yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats
            .sort((a, b) => {
              const dateA = a.last_timestamp ? new Date(a.last_timestamp).getTime() : new Date(a.created_at).getTime();
              const dateB = b.last_timestamp ? new Date(b.last_timestamp).getTime() : new Date(b.created_at).getTime();
              return dateB - dateA;
            })
            .map((chat) => (
            <Link
              key={chat.id}
              to={`/admin/chat/${chat.id}`}
              onClick={handleChatClick}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-primary-300 hover:shadow transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {chat.customer_name?.charAt(0).toUpperCase() || "?"}
                  </span>
                  {(chat.unread_count ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.customer_name || "Unknown Customer"}
                      </h3>
                      {(chat.unread_count ?? 0) > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 leading-none mt-0.5">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                    {chat.last_timestamp && (
                      <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2 whitespace-nowrap">
                        {formatTime(chat.last_timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5 leading-relaxed">
                    {chat.last_message || "No messages yet"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
