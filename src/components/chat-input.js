// src/components/chat-input.js
import { createElement } from "../lib/dom.js";

/**
 * onSend expects either:
 *   onSend({ text: "hello" })
 * or
 *   onSend({ file: File })
 */
export function ChatInput({ onSend, rerender }) {
  // wrapper (main container)
  const wrapper = createElement("div", {
    className: "chat-input flex items-center gap-2 p-3 border-t bg-white relative",
  });

  // group container (emoji + file + input)
  const inputGroup = createElement("div", {
    className: "flex items-center border rounded-full flex-row-reverse gap-1 flex-1 bg-white",
  });

  // hidden file input
  const fileInput = createElement("input", {
    type: "file",
    className: "hidden",
  });
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        onSend({ file });
      } finally {
        fileInput.value = "";
      }
    }
  });

  // text input
  const input = createElement("input", {
    type: "text",
    placeholder: "Type a message...",
    className: "flex-1 border border-gray-300 shadow-sm rounded-lg px-3 py-2",
  });

  // file button
  const fileBtn = createElement(
    "button",
    {
      className: "hover:bg-gray-100",
      type: "button",
      title: "Attach file",
    },
    "📎"
  );
  fileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  // emoji button
  const emojiBtn = createElement(
    "button",
    {
      className: "hover:bg-gray-100",
      type: "button",
      title: "Emoji",
    },
    "😊"
  );

  // send button (separate on the right)
  const sendBtn = createElement(
    "button",
    {
      className:
        "bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center",
      type: "button",
      title: "Send message",
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

  // emoji picker
  const emojiPicker = createElement("div", {
    className: "bg-white border rounded-lg shadow-lg p-2 grid gap-2 z-50",
    style:
      "position:absolute; left:0; bottom:56px; width:220px; display:none; grid-template-columns:repeat(6,1fr); max-height:200px; overflow:auto; padding:8px; box-sizing:border-box; transform-origin:bottom left;",
  });

  const emojiList = [
    "😀","😂","😍","😊","😎","👍","🎉","🔥","❤️","🙏",
    "😢","😡","🤔","👏","💡","🌟","🚀","🥳","🍕","⚡",
  ];

  emojiList.forEach((emoji) => {
    const btn = createElement(
      "button",
      {
        className:
          "text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100",
        type: "button",
        title: emoji,
      },
      emoji
    );
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      const before = input.value.slice(0, start);
      const after = input.value.slice(end);
      input.value = before + emoji + after;
      const caretPos = start + emoji.length;
      input.setSelectionRange(caretPos, caretPos);
      input.focus();
      hideEmojiPicker();
    });
    emojiPicker.appendChild(btn);
  });

  // toggle emoji picker
  let hideTimeout = null;
  const showEmojiPicker = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    emojiPicker.style.display = "grid";
    emojiPicker.style.opacity = "0";
    emojiPicker.style.transform = "scale(0.92)";
    requestAnimationFrame(() => {
      emojiPicker.style.transition = "opacity 180ms ease, transform 180ms ease";
      emojiPicker.style.opacity = "1";
      emojiPicker.style.transform = "scale(1)";
    });
  };
  const hideEmojiPicker = () => {
    emojiPicker.style.opacity = "0";
    emojiPicker.style.transform = "scale(0.92)";
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

  emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleEmojiPicker();
  });
  emojiPicker.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) hideEmojiPicker();
  });

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

  // assemble group first
  inputGroup.appendChild(emojiBtn);
  inputGroup.appendChild(fileBtn);
  inputGroup.appendChild(input);

  // assemble wrapper
  wrapper.appendChild(inputGroup);
  wrapper.appendChild(sendBtn);
  wrapper.appendChild(fileInput);
  wrapper.appendChild(emojiPicker);

  return wrapper;
}
