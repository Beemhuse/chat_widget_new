import { createElement } from "../lib/dom.js";

export function AudioCall({ businessName, avatarUrl, onEnd }) {
  let seconds = 0;
  let timer;
  let status = "Calling…";

  const container = createElement("div", {
    className: "flex flex-col items-center justify-center flex-1 bg-gray-900 text-white relative"
  });

  const nameEl = createElement("h2", { className: "text-lg font-semibold mt-2" }, businessName || "Support");
  const statusEl = createElement("p", { className: "text-sm text-gray-300 mt-1" }, status);

  const avatar = createElement("img", {
    src: avatarUrl || "https://via.placeholder.com/100",
    className: "w-24 h-24 rounded-full border-4 border-white mb-4"
  });

  const controls = createElement("div", { className: "absolute bottom-6 flex gap-6" }, [
    createElement("button", {
      className: "bg-red-600 p-3 rounded-full",
      onClick: () => {
        clearInterval(timer);
        onEnd();
      }
    }, "⛔"),
    createElement("button", { className: "bg-gray-700 p-3 rounded-full" }, "🎤") // mute
  ]);

  container.appendChild(avatar);
  container.appendChild(nameEl);
  container.appendChild(statusEl);
  container.appendChild(controls);

  // Simulate connecting after 2 seconds
  setTimeout(() => {
    status = "Connected";
    statusEl.textContent = status;

    // Start timer
    timer = setInterval(() => {
      seconds++;
      const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      statusEl.textContent = `${status} – ${mins}:${secs}`;
    }, 1000);
  }, 2000);

  return container;
}
