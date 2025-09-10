import { createElement } from "../lib/dom.js";

export function ChatBox({ messages = [], onSend }) {
  const container = createElement("div", {
    className: "bg-white rounded-lg shadow-lg p-4 w-80 h-96 flex flex-col",
  });

  // Header
  const header = createElement(
    "h2",
    { className: "font-bold text-lg mb-2" },
    "Chat Support"
  );

  // Messages
  const messageList = createElement(
    "div",
    {
      className:
        "flex-1 border p-2 mb-2 rounded overflow-auto text-sm",
    },
    messages.length > 0
      ? messages.map((msg) =>
          createElement("p", {}, msg.text)
        )
      : [createElement("p", {}, "Hello! How can I help you today?")]
  );

  // Input
  const input = createElement("input", {
    className: "border p-2 rounded text-sm",
    placeholder: "Type a message...",
  });

  // Send message on Enter key
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      onSend(input.value);
      input.value = "";
    }
  });

  container.appendChild(header);
  container.appendChild(messageList);
  container.appendChild(input);

  return container;
}
