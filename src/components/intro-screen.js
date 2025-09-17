import { createElement } from "../lib/dom.js";

export function IntroScreen({ onStart, isLoading = false }) {
  const loaderSVG = createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
  }, [
    createElement("circle", {
      cx: "4", cy: "12", r: "3", fill: "currentColor"
    }, [
      createElement("animate", {
        attributeName: "r",
        begin: "0; a3.end - 0.25s",
        dur: "0.75s",
        values: "3;.2;3"
      })
    ]),
    createElement("circle", {
      cx: "12", cy: "12", r: "3", fill: "currentColor"
    }, [
      createElement("animate", {
        attributeName: "r",
        begin: "a1.end - 0.6s",
        dur: "0.75s",
        values: "3;.2;3"
      })
    ]),
    createElement("circle", {
      cx: "20", cy: "12", r: "3", fill: "currentColor"
    }, [
      createElement("animate", {
        attributeName: "r",
        begin: "a1.end - 0.45s",
        dur: "0.75s",
        values: "3;.2;3"
      })
    ])
  ]);

  return createElement("div", {
    className:
      "flex flex-col items-center justify-center flex-1 p-6 text-center bg-gray-50"
  }, [
    createElement("img", {
      src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757512891/logo_ma0hyg.svg",
      alt: "Nanocodes Logo",
      className: "w-20 h-auto mb-4"
    }),
    createElement("p", { className: "text-sm text-gray-600 mb-6" },
      "Ask us anything – we’ll get back to you here or by email."
    ),
    createElement("button", {
      className: "bg-[#4789F2] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2",
      onClick: onStart,
      type: "button"
    }, isLoading ? loaderSVG : "Start Chat")
  ]);
}
