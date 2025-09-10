import { createElement } from "../lib/dom.js";
import { ChatHeader } from "./chat-header.js";
import { ChatBody } from "./chat-body.js";
import { ChatInput } from "./chat-input.js";
import { ChatFooter } from "./chat-footer.js";
import { VideoCall } from "./video-call.js";
import { AudioCall } from "./audio-call.js";

export function WidgetComponent({ businessName, avatarUrl }) {
  let messages = [
    { sender: "bot", text: "Hello! How can I help you today?" },
  ];

  let view = "intro"; // "intro" | "chat" | "video" | "audio"

  const container = createElement("div", {
    className: "widget-component fixed bottom-20 right-5 w-80 h-[480px] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden"
  });

  const handleSendMessage = (text) => {
    messages.push({ sender: "user", text });
    rerender();

    setTimeout(() => {
      messages.push({ sender: "bot", text: "Thanks for your message! 👌" });
      rerender();
    }, 800);
  };

  const rerender = () => {
    container.innerHTML = "";

    container.appendChild(ChatHeader({
      businessName,
      avatarUrl,
      onBack: () => {
        view = "chat";
        rerender();
      },
      onVideo: () => {
        view = "video";
        rerender();
      },
      onAudio: () => {
        view = "audio";
        rerender();
      },
      showBack: view !== "chat" && view !== "intro"
    }));

    let body;
    if (view === "intro") {
      body = createElement("div", {
        className: "flex flex-col items-center justify-center flex-1 p-6 text-center bg-gray-50"
      }, [
        createElement("img", {
          src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757512891/logo_ma0hyg.svg",
          alt: "Nanocodes Logo",
          className: "w-20 h-auto mb-4"
        }),
        createElement("p", { className: "text-sm text-gray-600 mb-6" }, "Ask us anything – we’ll get back to you here or by email."),
        createElement("button", {
          className: "bg-[#4789F2] text-white px-4 py-2 rounded-lg",
          onClick: () => {
            view = "chat";
            rerender();
          }
        }, "Start Chat")
      ]);
    } else if (view === "chat") {
      body = ChatBody({ messages });
    } else if (view === "video") {
      body = VideoCall({
        businessName,
        avatarUrl,
        onEnd: () => {
          view = "chat";
          rerender();
        }
      });
    } else if (view === "audio") {
      body = AudioCall({
        businessName,
        avatarUrl,
        onEnd: () => {
          view = "chat";
          rerender();
        }
      });
    }

    container.appendChild(body);

    if (view === "chat") {
      container.appendChild(ChatInput({ onSend: handleSendMessage }));
    }

    container.appendChild(ChatFooter());
  };

  rerender();
  return container;
}
