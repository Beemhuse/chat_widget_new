import { WebSocketService } from "./websocket_service.js";

const isDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const WS_BASE_URL = isDev
  ? "wss://apiv2.andromedia.cc/ws/visitor-chat/"
  : "wss://your-api.com/ws/visitor-chat/";

// 🔹 Initialize WebSocket
export const initWebSocket = (sessionId, visitorId, messages, rerender) => {
  const socketService = new WebSocketService(WS_BASE_URL, sessionId, visitorId);

  socketService
    .on("open", () => console.log("✅ WebSocket connected"))
    .on("message", (msg) => {
      console.log("📩 WS Message:", msg);

      if (msg.is_file) {
        messages.push({
          sender: msg.sender || "bot",
          file: msg.message,
        });
      } else {
        messages.push({
          sender: msg.sender || "bot",
          text: msg.message,
        });
      }

      rerender();
    })
    .on("close", () => console.warn("⚠️ WebSocket closed"))
    .on("error", (err) => console.error("❌ WebSocket error:", err));

  socketService.connect();
  return socketService;
};
