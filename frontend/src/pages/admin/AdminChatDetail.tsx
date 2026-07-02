import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { chatService, type Message } from "../../services/chat";
import { useAdminNotifications } from "../../store/AdminNotificationContext";
import { formatTime } from "../../utils/time";

export default function AdminChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { fetchNotifications } = useAdminNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const scrollDown = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollDown(); }, [messages]);

  const connectWs = useCallback((chatId: string) => {
    if (wsRef.current) wsRef.current.close();
    const ws = chatService.connectWebSocket(chatId);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(() => connectWs(chatId), 3000);
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        } else if (data.type === "typing") {
          if (data.sender_role === "customer") {
            setTyping(true);
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setTyping(false), 2000);
          }
        }
      } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    chatService.getMessages(id).then((res) => setMessages(res.items));
    chatService.markRead(id).then(() => fetchNotifications()).catch(() => {});
    connectWs(id);
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [id, connectWs, fetchNotifications]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ message: text }));
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/admin/chats"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Support Chat</h1>
          <p className="text-sm text-gray-500">
            {connected ? "Connected" : "Reconnecting..."}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            No messages yet. Reply to start helping this customer.
          </div>
        )}
        {messages.map((msg) => {
          const isAdmin = msg.sender_role === "admin";
          return (
            <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isAdmin
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : msg.sender_role === "bot"
                    ? "bg-gray-200 text-gray-800 rounded-bl-sm"
                    : "bg-white text-gray-800 rounded-bl-sm"
                }`}
              >
                {!isAdmin && (
                  <p className={`text-xs font-semibold mb-0.5 ${msg.sender_role === "bot" ? "text-gray-500" : "text-primary-600"}`}>
                    {msg.sender_role === "bot" ? "Bot" : "Customer"}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-xs mt-1 ${isAdmin ? "text-white/60" : "text-gray-400"}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-500 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm italic">
              Customer is typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3 rounded-b-xl">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected}
            className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
