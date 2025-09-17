// src/components/chat-input.js
import { createElement } from "../lib/dom.js";

/**
 * onSend expects either:
 *   onSend({ text: "hello" })
 * or
 *   onSend({ file: File })
 */
export function ChatInput({ onSend, rerender }) {
  // wrapper (relative so emoji menu can be positioned)
  const wrapper = createElement("div", {
    className: "chat-input flex items-center gap-2 p-3 border-t bg-white relative",
  });

  // hidden file input
  const fileInput = createElement("input", {
    type: "file",
    className: "hidden",
    // accept attribute optional: e.g. "image/*,application/pdf"
  });
  // attach change listener after creation (so we can use DOM methods)
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        onSend({ file });
      } finally {
        fileInput.value = ""; // reset so same file can be chosen later
      }
    }
  });

  // text input
  const input = createElement("input", {
    type: "text",
    placeholder: "Type a message...",
    className: "flex-1 border rounded-lg px-3 py-2",
  });

  // send button
  const sendBtn = createElement(
    "button",
    {
      className: "bg-blue-600 text-white px-4 py-2 rounded-lg",
      type: "button",
    },
    "Send"
  );
  sendBtn.addEventListener("click", () => {
    const txt = input.value.trim();
    if (txt) {
      onSend({ text: txt });
      input.value = "";
    }
  });

  // file (attachment) button
  const fileBtn = createElement(
    "button",
    {
      className: "px-2 py-1 rounded hover:bg-gray-100",
      type: "button",
      title: "Attach file",
    },
    "📎"
  );
  fileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  // emoji toggle button
  const emojiBtn = createElement(
    "button",
    {
      className: "px-2 py-1 rounded hover:bg-gray-100",
      type: "button",
      title: "Emoji",
    },
    "😊"
  );

  // emoji picker (initially hidden via inline styles)
  const emojiPicker = createElement(
    "div",
    {
      className:
        "bg-white border rounded-lg shadow-lg p-2 grid gap-2 z-50",
      // we'll position and animate via inline styles below
      style:
        "position:absolute; left:0; bottom:56px; width:220px; display:none; grid-template-columns:repeat(6,1fr); max-height:200px; overflow:auto; padding:8px; box-sizing:border-box; transform-origin:bottom left;"
    }
  );

  // emoji list (a simple but decent set)
  const emojiList = [
    "😀","😂","😍","😊","😎","👍","🎉","🔥","❤️","🙏",
    "😢","😡","🤔","👏","💡","🌟","🚀","🥳","🍕","⚡",
  ];

  // create emoji buttons
  emojiList.forEach((emoji) => {
    const btn = createElement(
      "button",
      {
        className: "text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100",
        type: "button",
        title: emoji,
      },
      emoji
    );
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      // append emoji to input at caret
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      const before = input.value.slice(0, start);
      const after = input.value.slice(end);
      input.value = before + emoji + after;
      // move caret after inserted emoji
      const caretPos = start + emoji.length;
      input.setSelectionRange(caretPos, caretPos);
      input.focus();
      hideEmojiPicker();
    });
    emojiPicker.appendChild(btn);
  });

  // animation helpers
  let hideTimeout = null;
  const showEmojiPicker = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    // make visible then animate
    emojiPicker.style.display = "grid";
    // ensure starting state
    emojiPicker.style.opacity = "0";
    emojiPicker.style.transform = "scale(0.92)";
    // trigger transition (give the browser a tick)
    requestAnimationFrame(() => {
      emojiPicker.style.transition = "opacity 180ms ease, transform 180ms ease";
      emojiPicker.style.opacity = "1";
      emojiPicker.style.transform = "scale(1)";
    });
  };

  const hideEmojiPicker = () => {
    emojiPicker.style.opacity = "0";
    emojiPicker.style.transform = "scale(0.92)";
    // after transition, hide completely
    hideTimeout = setTimeout(() => {
      emojiPicker.style.display = "none";
    }, 200);
  };

  const toggleEmojiPicker = () => {
    if (emojiPicker.style.display === "none" || !emojiPicker.style.display) {
      showEmojiPicker();
    } else {
      hideEmojiPicker();
    }
  };

  // emoji button toggling (stop propagation so outside click handler doesn't immediately close)
  emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleEmojiPicker();
  });

  // clicking inside the picker should not close it
  emojiPicker.addEventListener("click", (e) => e.stopPropagation());

  // close on outside click
  const onDocClick = (e) => {
    if (!wrapper.contains(e.target)) {
      hideEmojiPicker();
    }
  };
  document.addEventListener("click", onDocClick);

  // Enter key to send (Shift+Enter to newline)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const txt = input.value.trim();
      if (txt) {
        onSend({ text: txt });
        input.value = "";
      }
    }
  });

  wrapper.appendChild(emojiBtn);
  wrapper.appendChild(fileBtn);
  wrapper.appendChild(input);
  wrapper.appendChild(sendBtn);
  wrapper.appendChild(fileInput);
  wrapper.appendChild(emojiPicker);

  wrapper.cleanup = () => {
    document.removeEventListener("click", onDocClick);
  };

  return wrapper;
}
