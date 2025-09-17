import { createElement } from "../lib/dom.js";

export function WidgetButton({ isOpen, onClick, position = "top" }) {
  // Map position to Tailwind classes
  const positionClasses = {
    top: "top-2 left-5",
    right: "top-2 right-5",
    left: "bottom-2 left-5",
    bottom: "bottom-2 right-5",
  };

  return createElement("img", {
    src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757505272/Trigger_daiul2.svg",
    className: `fixed cursor-pointer w-24 h-24 flex items-center justify-center z-[10000]
                animate-pulse transition-transform duration-300 ease-in-out
                ${isOpen ? "rotate-180" : "rotate-0"}
                ${positionClasses[position] || positionClasses.bottom}`,
    onClick,
  });
}
