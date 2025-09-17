import { createElement } from "../lib/dom.js";
import { WidgetButton } from "../components/widget-button.js";
import { WidgetComponent } from "../components/widget-component.js";
import { fetcher } from "../lib/api.js";

// Map button positions
const buttonPositionClasses = {
  top_left: "top-2 left-5",
  top_right: "top-2 right-5",
  bottom_left: "bottom-2 left-5",
  bottom_right: "bottom-2 right-5",
};

// Map widget positions (chat box relative to button)
const widgetPositionClasses = {
  top_left: "top-28 left-5",
  top_right: "top-28 right-5",
  bottom_left: "bottom-28 left-5",
  bottom_right: "bottom-28 right-5",
};

export function WidgetApp({
  widgetId = "d6518226-275f-40de-a98e-92571004892b",
}) {
  const container = createElement("div", { className: "widget-app" });

  let businessData = null;

  const getPayload = () => {
    return businessData?.data ?? businessData ?? null;
  };

  // check device type
  const isMobile = () => window.innerWidth < 768;

  const rerender = () => {
    container.innerHTML = ""; // clear previous render
    const payload = getPayload();

    // If no payload OR widget is not enabled → render nothing
    if (!payload || payload.display_widget !== true) {
      return;
    }

    // check widget_device constraint
    const allowedDevice = (payload?.devices || "desktop and mobile").toLowerCase();
    if (
      (isMobile() && !["mobile", "desktop and mobile"].includes(allowedDevice)) ||
      (!isMobile() && !["desktop", "desktop and mobile"].includes(allowedDevice))
    ) {
      return; // not allowed on this device
    }

    // Normalize widget position (accept snake/dash/camel cases)
    const rawPosition = (payload.widget_position || "bottom_right").toString();
    const widgetPosition = rawPosition.toLowerCase().replace(/[\s-]+/g, "_");

    const buttonPosClass =
      buttonPositionClasses[widgetPosition] ||
      buttonPositionClasses.bottom_right;
    const widgetPosClass =
      widgetPositionClasses[widgetPosition] ||
      widgetPositionClasses.bottom_right;

    // render the button
    container.appendChild(
      WidgetButton({
        isOpen: store.isOpen,
        onClick: () => store.toggle(),
        position: widgetPosition,
        positionClass: buttonPosClass,
      })
    );

    // render the chat box if open
    if (store.isOpen) {
      const wrapper = createElement("div", {
        className: `fixed z-50 ${widgetPosClass}`,
      });
      wrapper.appendChild(
        WidgetComponent({
          businessName: payload.full_name ?? payload.business_name ?? "",
          avatarUrl: payload.avatar ?? "",
          logo: payload.logo ?? "",
          businessData: payload,
        })
      );
      container.appendChild(wrapper);
    }
  };

  // simple store for widget state
  const store = {
    isOpen: false,
    toggle() {
      this.isOpen = !this.isOpen;
      rerender();
    },
  };

  // fetch business data
  if (widgetId) {
    fetcher(`business/public-business/${widgetId}/`)
      .then((data) => {
        businessData = data;
        rerender();
      })
      .catch((err) => {
        console.error("[WidgetApp] Failed to fetch business data:", err);
      });
  }

  // rerender on resize (so device rules re-apply)
  window.addEventListener("resize", () => rerender());

  rerender(); // initial render
  return container;
}
