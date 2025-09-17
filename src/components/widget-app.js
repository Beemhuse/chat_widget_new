import { createElement } from "../lib/dom.js";
import { WidgetButton } from "../components/widget-button.js";
import { WidgetComponent } from "../components/widget-component.js";
import { fetcher } from "../lib/api.js";

export function WidgetApp({
  widgetId = "d6518226-275f-40de-a98e-92571004892b",
}) {
  const container = createElement("div", { className: "widget-app" });

  let businessData = null;

  const rerender = () => {
    container.innerHTML = ""; // clear previous render

    container.appendChild(
      WidgetButton({
        isOpen: store.isOpen,
        onClick: () => store.toggle(),
      })
    );

    // add chat widget if open
    if (store.isOpen) {
      const wrapper = createElement("div", {
        className: "fixed bottom-20 right-5 z-50",
      });
      wrapper.appendChild(
        WidgetComponent({
          businessName: businessData?.full_name,
          avatarUrl: businessData?.avatar,
          businessData
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

  rerender(); // initial render
  return container;
}
