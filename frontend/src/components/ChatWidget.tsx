import { useEffect, useRef, useState, useCallback } from "react";
import { chatService, type Message } from "../services/chat";
import { formatTime } from "../utils/time";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scrollDown = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollDown(); }, [messages]);

  const connectWs = useCallback((id: string) => {
    if (wsRef.current) wsRef.current.close();
    const ws = chatService.connectWebSocket(id);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(() => connectWs(id), 3000);
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    chatService.startChat().then((s) => {
      setChatId(s.id);
      chatService.getMessages(s.id).then((res) => {
        setMessages(res.items);
        setLoading(false);
      });
      chatService.markRead(s.id).catch(() => {});
      connectWs(s.id);
    });
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [open, connectWs]);

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
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-700 transition-all hover:scale-105 active:scale-95"
          aria-label="Open support chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-[420px]:w-[calc(100vw-2rem)] max-[420px]:right-4 h-[540px] max-[540px]:h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Support Chat</h3>
              <p className="text-xs text-white/70">
                {loading ? "Connecting..." : connected ? "Online" : "Reconnecting..."}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">
                Start a conversation with our support team
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_role === "customer";
                const isBot = msg.sender_role === "bot";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isMe
                          ? "bg-primary-600 text-white rounded-br-sm"
                          : isBot
                          ? "bg-gray-200 text-gray-800 rounded-bl-sm"
                          : "bg-white text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {!isMe && (
                        <p className={`text-xs font-semibold mb-0.5 ${isBot ? "text-gray-500" : "text-primary-600"}`}>
                          {isBot ? "Bot" : "Support"}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-gray-400"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !connected}
                className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
