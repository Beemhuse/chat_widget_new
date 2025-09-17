import { createElement } from "../lib/dom.js";
import { IntroScreen } from "../components/intro-screen.js";
import { ChatHeader } from "../components/chat-header.js";
import { ChatBody } from "../components/chat-body.js";
import { ChatInput } from "../components/chat-input.js";
import { ChatFooter } from "../components/chat-footer.js";
import { VideoCall } from "../components/video-call.js";
import { AudioCall } from "../components/audio-call.js";
import useCommsStore from "../store/useCommsStore.js";
import {
  startChatSession,
  handleSendMessage,
  checkChatSession,
} from "../services/chat-service.js";
import { initWebSocket } from "../services/websocket-init.js";

export function WidgetComponent({ businessName, avatarUrl, logo, businessData }) {
  let messages = [
    { sender: "bot", content: "Hello! How can I help you today?" },
  ];
  let view = "intro";
  let socketService = null;
  let isLoading = false;
  let sessionId = null;
console.log(businessData)
  const container = createElement("div", {
    className:
      "widget-component fixed bottom-20 right-5 w-80 h-[480px] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden",
  });
  /** 🔹 Handle starting a call (video/audio) */

 const rerender = () => {
  const { handleStartCall } = useCommsStore;

  container.innerHTML = "";

  // ✅ Header must return a DOM node
  const header = ChatHeader({
    businessName,
    businessData,
    avatarUrl,
    onBack: () => {
      view = "chat";
      rerender();
    },
    onVideo: async () => {
      view = "video";
      await handleStartCall(businessData);
      rerender();
    },
    onAudio: () => {
      view = "audio";
      rerender();
    },
    showBack: view !== "chat" && view !== "intro",
  });
  if (header) container.appendChild(header);

  let body = null;

  if (view === "intro") {
    body = IntroScreen({
      isLoading,
      onStart: async () => {
        const visitorId = localStorage.getItem("guest_id") || crypto.randomUUID();
        localStorage.setItem("guest_id", visitorId);

        const response = await startChatSession(
          visitorId,
          businessData?.data?.id,
          rerender
        );

        if (response) {
          sessionId = response?.data?.id;

          const history = await checkChatSession(sessionId);
          if (history.length > 0) {
            messages.length = 0;
            messages.push(
              ...history.map((msg) => ({
                sender: msg.from_agent ? "agent" : "visitor",
                content: msg.content || "",
              }))
            );
          }

          socketService = initWebSocket(
            sessionId,
            visitorId,
            messages,
            rerender
          );

          view = "chat";
          rerender();
        }
      },
    });
  } else if (view === "chat") {
    body = ChatBody({ messages });
  } else if (view === "video") {
    body = VideoCall({
      businessName,
      avatarUrl,
      onStart: () => handleStartCall(businessData),
      onEnd: () => {
        view = "chat";
        rerender();
      },
    });
  } else if (view === "audio") {
    body = AudioCall({
      businessName,
      avatarUrl,
      onEnd: () => {
        view = "chat";
        rerender();
      },
    });
  }

  if (body) container.appendChild(body);

  if (view === "chat") {
    const input = ChatInput({
      onSend: (data) =>
        handleSendMessage(data, messages, socketService, rerender),
    });
    if (input) container.appendChild(input);
  }

  const footer = ChatFooter();
  if (footer) container.appendChild(footer);
};


  rerender();
  return container;
}
