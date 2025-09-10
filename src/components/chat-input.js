import { createElement } from "../lib/dom.js";

export function ChatInput({ onSend }) {
  const wrapper = createElement("div", {
    className: "chat-input flex gap-2 p-3 border-t bg-white"
  });

  const input = createElement("input", {
    type: "text",
    placeholder: "Type a message...",
    className: "flex-1 border rounded-lg px-3 py-2",
  });

  const button = createElement("button", {
    className: "bg-blue-600 text-white px-4 py-2 rounded-lg",
    onClick: () => {
      if (input.value.trim()) {
        onSend(input.value);
        input.value = "";
      }
    }
  }, "Send");

  wrapper.appendChild(input);
  wrapper.appendChild(button);

  return wrapper;
}
