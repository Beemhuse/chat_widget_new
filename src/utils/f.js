// 🔹 Check if session exists
const isDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isDev
  ? "https://apiv2.andromedia.cc/"
  : "https://your-api.com";

export const checkChatSession = async (sessionId) => {
  try {
    const res = await fetch(`${API_BASE_URL}chat/history/${sessionId}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const responseData = await res.json();

    return responseData;
  } catch (err) {
    console.error("❌ Failed to fetch session:", err);
    return null;
  }
};


