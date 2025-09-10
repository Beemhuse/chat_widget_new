const API_BASE_URL = "https://api.example.com/"; // <-- change to your backend

/**
 * Simple fetch wrapper
 * @param {string} url - relative or absolute URL
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} - parsed JSON response
 */
export async function fetcher(url, options = {}) {
  try {
    const res = await fetch(
      url.startsWith("http") ? url : API_BASE_URL + url,
      {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `[Fetcher] Request failed ${res.status}: ${errorText || res.statusText}`
      );
    }

    return res.json();
  } catch (err) {
    console.error("[Fetcher] Error:", err);
    throw err;
  }
}
