import { createElement } from "../lib/dom.js";

export function ChatHeader({
  businessName,
  businessData,
  avatarUrl,
  onBack,
  onVideo,
  onAudio,
  showBack = false,
}) {
  // Extract theme colours with fallback
  const backgroundColour = businessData?.background_colour || "#4789F2";
  const brandColour = businessData?.brand_colour || "#ffffff";
  const online_message = businessData?.online_status || "We reply immediately";
  return createElement(
    "div",
    {
      className: "chat-header flex items-center justify-between p-3",
      style: `background-color: ${backgroundColour}; color: white;`,
    },
    [
      // Left Section (Back + Avatar + Name/Status)
      createElement("div", { className: "flex items-center gap-2 flex-1" }, [
        // Back arrow (conditionally shown)
        showBack &&
          createElement("img", {
            src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757504192/back_wzaxbt.svg",
            className: "h-4 w-4 cursor-pointer",
            onClick: onBack || (() => console.log("Back clicked")),
          }),

        // Avatar
        createElement("img", {
          src:
            avatarUrl ||
            "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757504499/man_k3usb0.svg",
          className: "w-8 h-8 rounded-full",
        }),

        // Name + Online Status
        createElement("div", { className: "flex flex-col leading-tight" }, [
          createElement(
            "h2",
            {
              className: "font-semibold text-sm pl-5",
              style: `color: ${brandColour};`, // highlight brand name
            },
            businessName || "Support"
          ),
          createElement("div", { className: "flex items-center gap-2" }, [
            createElement("img", {
              src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757512372/nrk_radio-active_xlqgav.svg",
              className: "w-4 h-4",
            }),
            createElement(
              "span",
              { className: "text-xs text-gray-100" },
              online_message
            ),
          ]),
        ]),
      ]),

      // Right Section (Audio + Video)
      createElement("div", { className: "flex items-center gap-3" }, [
        createElement("img", {
          src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757510132/audio_dxsxxe.svg",
          className: "w-4 h-4 cursor-pointer",
          onClick: onAudio || (() => console.log("Audio call clicked")),
        }),
        createElement("img", {
          src: "https://res.cloudinary.com/dzvyfd7is/image/upload/v1757510130/video_ntcr0f.svg",
          className: "w-4 h-4 cursor-pointer",
          onClick: onVideo || (() => console.log("Video call clicked")),
        }),
      ]),
    ]
  );
}
