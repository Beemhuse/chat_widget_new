import { createElement } from "../lib/dom.js";

export function ChatFooter() {
  return createElement("div", {
    className: "chat-footer text-center text-xs text-gray-500 p-2 border-t"
  }, "Powered by AndroMedia");
}
