// components/video-call.js
import { createElement } from "../lib/dom.js";
import store from "../store/index.js";

export function VideoCall({ businessName, avatarUrl, onStart, onEnd }) {
  const { getState, updateLocalFeed, removeLocalFeed, setRemoteFeeds } = store;
  const { localFeeds, remoteFeeds } = getState();

  let isMuted = false;
  let videoOff = false;

  const container = createElement("div", {
    className: "flex flex-col w-full h-full bg-black relative",
  });

  // 🔹 Render local video
  const localContainer = createElement("div", {
    className: "absolute bottom-0 right-2 w-32 h-full bg-gray-800 rounded overflow-hidden",
  });

  if (localFeeds.length > 0) {
    const localVideo = document.createElement("video");
    localVideo.autoplay = true;
    localVideo.muted = true; // self-preview
    localVideo.playsInline = true;
    localVideo.srcObject = localFeeds[0].stream;
    localContainer.appendChild(localVideo);
  }

  // 🔹 Render remote videos
  const remoteContainer = createElement("div", {
    className: "flex-1 flex flex-wrap justify-center items-center",
  });

  remoteFeeds.forEach((feed) => {
    const vid = document.createElement("video");
    vid.autoplay = true;
    vid.playsInline = true;
    vid.srcObject = feed.stream;
    vid.className = "w-1/2 h-1/2 object-cover bg-black";
    remoteContainer.appendChild(vid);
  });

  // 🔹 Controls
  const controls = createElement("div", {
    className:
      "absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4 bg-black/60",
  });

  const btn = (label, handler) => {
    const b = createElement("button", {
      className:
        "px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600",
    });
    b.textContent = label;
    b.onclick = handler;
    return b;
  };

  // Toggle audio
  controls.appendChild(
    btn(isMuted ? "Unmute" : "Mute", () => {
      const local = getState().localFeeds[0];
      if (local?.stream) {
        local.stream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
        isMuted = !isMuted;
        updateLocalFeed(local.id, { audioEnabled: !isMuted });
        rerender();
      }
    })
  );

  // Toggle video
  controls.appendChild(
    btn(videoOff ? "Start Video" : "Stop Video", () => {
      const local = getState().localFeeds[0];
      if (local?.stream) {
        local.stream.getVideoTracks().forEach((t) => (t.enabled = videoOff));
        videoOff = !videoOff;
        updateLocalFeed(local.id, { videoEnabled: !videoOff });
        rerender();
      }
    })
  );

  // End call
  controls.appendChild(
    btn("End Call", () => {
      // stop local streams
      const { localFeeds, remoteFeeds } = getState();
      localFeeds.forEach((feed) => {
        feed.stream?.getTracks().forEach((t) => t.stop());
        removeLocalFeed(feed.id);
      });
      // clear remote feeds
      setRemoteFeeds([]);

      if (onEnd) onEnd();
    })
  );

  // Append children
  container.appendChild(remoteContainer);
  container.appendChild(localContainer);
  container.appendChild(controls);

  return container;

  // rerender function inside component (to refresh button states)
  function rerender() {
    const newNode = VideoCall({ businessName, avatarUrl, onStart, onEnd });
    container.replaceWith(newNode);
  }
}
