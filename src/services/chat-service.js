const isDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isDev
  ? "https://apiv2.andromedia.cc/"
  : "https://your-api.com";

export const startChatSession = async (visitorId, businessId) => {
  const payload = { visitor_id: visitorId, business: businessId };

  try {
    const res = await fetch(`${API_BASE_URL}chat/start-session/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const responseData = await res.json();

    localStorage.setItem("guest_id", responseData?.data?.end_user?.guest_id);
    localStorage.setItem("session_id", responseData?.data?.id);

    return responseData;
  } catch (err) {
    console.error("❌ Failed to start chat:", err);
    return null;
  }
};
/**
 * ✅ Fetch chat history by session ID
 * @param {string} sessionId
 * @returns {Promise<Array>} List of messages
 */
export const checkChatSession = async (sessionId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}chat/messages/${sessionId}/history/`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const responseData = await res.json();
    console.log(responseData);
    return responseData?.message || []; // ensure it returns an array
  } catch (err) {
    console.error("❌ Failed to fetch session:", err);
    return [];
  }
};

// 🔹 Send message or file
export const handleSendMessage = async (
  { text, file },
  messages,
  socketService,
  rerender
) => {
  let sessionId = localStorage.getItem("session_id");

  let messagePayload = {
    type: "text",
    sender_id: "visitor",
    timestamp: new Date().toISOString(),
  };

  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}chat/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("File upload failed");
      const uploaded = await uploadRes.json();

      messagePayload.message = uploaded?.data?.file;
      messagePayload.is_file = true;
      messages.push({
        sender: "visitor",
        file: uploaded?.data?.file,
        type: "file",
      });
    } catch (err) {
      console.error("❌ File upload failed:", err);
      return;
    }
  } else if (text) {
    console.log(text)
    messagePayload.content = text;
    messages.push({ sender: "visitor", content: text });
  }

  if (socketService && socketService.isConnected()) {
    socketService.send(messagePayload);
  }

  rerender();
};
