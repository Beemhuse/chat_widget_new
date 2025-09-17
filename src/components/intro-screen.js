import { createElement } from "../lib/dom.js";

export function IntroScreen({ onStart, bg_color, logo, isLoading = false }) {
  // Loader using bouncing dots animation
  const loaderDiv = createElement(
    "div",
    { className: "flex items-center gap-1" },
    [
      createElement("span", {
        className:
          "w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]",
      }),
      createElement("span", {
        className:
          "w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]",
      }),
      createElement("span", {
        className: "w-2 h-2 rounded-full bg-white animate-bounce",
      }),
    ]
  );

  return createElement(
    "div",
    {
      className:
        "flex flex-col items-center justify-center flex-1 p-6 text-center bg-gray-50",
    },
    [
      createElement("img", {
        src: logo,
        alt: "Logo",
        className: "w-20 h-auto mb-4",
      }),
      createElement(
        "p",
        { className: "text-sm text-gray-600 mb-6" },
        "Ask us anything – we’ll get back to you here or by email."
      ),
      createElement(
        "button",
        {
          className:
            "text-white px-4 py-2 cursor-pointer rounded-lg flex items-center justify-center gap-2 min-w-[120px] h-10",
          onClick: onStart,
          type: "button",
          style: { backgroundColor: bg_color || "#4789F2" }, // ✅ dynamic background
        },
        isLoading ? loaderDiv : "Start Chat"
      ),
    ]
  );
}
