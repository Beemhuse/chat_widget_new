import { createElement } from "../lib/dom.js";

export function WidgetButton({ isOpen, onClick }) {
  return createElement(
    "img",
    {
      src: isOpen? "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757505272/Trigger_daiul2.svg" : "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757505272/Trigger_daiul2.svg",

      className:
        "fixed bottom-5 right-5 w-24 h-24 flex items-center justify-center z-50",
      onClick,
    },
  );
}
