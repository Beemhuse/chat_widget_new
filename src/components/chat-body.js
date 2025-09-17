import { createElement } from "../lib/dom.js";

export function ChatBody({ messages }) {
  console.log(messages, "===>>> messages");

  const container = createElement("div", {
    className:
      "chat-body flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100",
  });

  messages.forEach((msg) => {
    const isVisitor = msg.sender === "visitor"; // ✅ make sure to use same property consistently

    // Each message row (important for alignment)
    const row = createElement("div", {
      className: `w-full flex ${isVisitor ? "justify-end" : "justify-start"}`,
    });

    const bubble = createElement(
      "div",
      {
        className: `px-3 py-2 rounded-2xl shadow-md text-sm leading-relaxed max-w-[75%] whitespace-pre-wrap ${
          isVisitor
            ? "bg-blue-500 text-white rounded-br-none" // visitor (right)
            : "bg-green-100 text-black rounded-bl-none" // agent/bot (left)
        }`,
      },
      msg.text || msg.content
    );

    row.appendChild(bubble);
    container.appendChild(row);
  });

  return container;
}
