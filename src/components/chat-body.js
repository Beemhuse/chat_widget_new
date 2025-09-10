import { createElement } from "../lib/dom.js";

export function ChatBody({ messages }) {
  const container = createElement("div", {
    className: "chat-body flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
  });

  messages.forEach(msg => {
    const bubble = createElement("div", {
      className: `p-2 rounded-lg max-w-xs ${
        msg.sender === "user" 
          ? "bg-blue-500 text-white self-end ml-auto" 
          : "bg-gray-200 text-black"
      }`
    }, msg.text);

    container.appendChild(bubble);
  });

  return container;
}
