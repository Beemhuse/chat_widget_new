import { WidgetApp } from "./components/widget-app.js";
import cssText from "./tailwind.css"; // compiled CSS file
console.log(cssText)
function getWidgetIdFromScriptTag() {
  let script =
    document.currentScript ||
    Array.from(document.querySelectorAll("script")).find((s) =>
      s.src.includes("chat-widget")
    );

  return script?.dataset?.id || null;
}
function mountWidget() {
  if (document.getElementById("chat-support-widget-host")) return; // already mounted

  const widgetId = getWidgetIdFromScriptTag();
  if (!widgetId) {
    console.warn("[ChatWidget] No widget ID found in script tag URL.");
    return;
  }

  const container = document.createElement("div");
  container.id = "chat-support-widget-host";
  document.body.appendChild(container);

  let rootTarget;

  if (window.__CHAT_WIDGET_DEV__) {
    // Dev mode mounts directly
    rootTarget = container;
  } else {
    // Production → Shadow DOM for style encapsulation
    const shadowRoot = container.attachShadow({ mode: "open" });

    // Inject CSS bundle
    const style = document.createElement("style");
    style.textContent = cssText;
    shadowRoot.appendChild(style);

    // Create a mount target inside shadow
    rootTarget = document.createElement("div");
    shadowRoot.appendChild(rootTarget);
  }

  // Mount the widget
  const widget = WidgetApp({ widgetId });
  rootTarget.appendChild(widget);
}

export function initChatWidget(options = {}) {
  if (options.devMode) {
    window.__CHAT_WIDGET_DEV__ = true;
  }
  const { delay = 0 } = options;
  setTimeout(mountWidget, delay);
}

// Auto init unless disabled
if (!window.__CHAT_WIDGET_NO_AUTO_INIT__) {
  initChatWidget({ delay: 1000 });
}

window.ChatWidget = { init: initChatWidget };
