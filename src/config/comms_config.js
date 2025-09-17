// import { toast } from "react-toastify";

// Base URL for the comms HTTP API (not WS). Expected env: VITE_COMMS_API_URL
const BASE_URL =  "https://api.clearcomms.space";

// Required API key header for comms service
const COMMS_API_KEY = "ak_70cee94cf850485e933771a5d17ea4b1";

if (!COMMS_API_KEY) {
  console.warn(
    "VITE_COMMS_API_KEY is not set. Comms requests will likely fail."
  );
}

if (!BASE_URL) {
  console.warn(
    "VITE_COMMS_API_URL is not set. Comms requests will use relative paths."
  );
}

// Build headers for requests. Automatically sets JSON Content-Type when body is an object
const buildHeaders = (extraHeaders = {}, hasJsonBody = false) => {
  const headers = new Headers();

  // Comms API key header
  headers.set("x-api-key", COMMS_API_KEY || "");

  if (hasJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  // Merge any extra headers
  Object.entries(extraHeaders || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) headers.set(key, value);
  });

  return headers;
};

// Safe JSON parse helper
const parseJsonSafe = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
};

// Core request wrapper using window.fetch
export const commsRequest = async ({
  method = "GET",
  path = "",
  query,
  body,
  headers,
  baseUrl,
  showSuccessToast = false,
  successMessage,
} = {}) => {
  const urlBase = baseUrl || BASE_URL;

  // Build URL
  const url = new URL(
    (path || "").startsWith("http") ? path : `${urlBase}${path}`
  );
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const hasJsonBody =
    body && !(body instanceof FormData) && typeof body === "object";
  const init = {
    method,
    headers: buildHeaders(headers, hasJsonBody),
    body: hasJsonBody ? JSON.stringify(body) : body,
    credentials: "omit",
  };

  try {
    const res = await fetch(url, init);
    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const message =
        (data && (data.detail || data.message)) ||
        `Request failed (${res.status})`;
      toast.error(message);
      const error = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    if (showSuccessToast && successMessage) {
      return successMessage
    }

    return data;
  } catch (err) {
    if (!err?.status) {
      throw (err?.message || "Network error");
    }
    throw err;
  }
};

// Convenience helpers
export const commsGet = (path, { query, headers, baseUrl } = {}) =>
  commsRequest({ method: "GET", path, query, headers, baseUrl });

export const commsPost = (
  path,
  body,
  { headers, baseUrl, showSuccessToast, successMessage } = {}
) =>
  commsRequest({
    method: "POST",
    path,
    body,
    headers,
    baseUrl,
    showSuccessToast,
    successMessage,
  });

export const commsPut = (
  path,
  body,
  { headers, baseUrl, showSuccessToast, successMessage } = {}
) =>
  commsRequest({
    method: "PUT",
    path,
    body,
    headers,
    baseUrl,
    showSuccessToast,
    successMessage,
  });

export const commsPatch = (
  path,
  body,
  { headers, baseUrl, showSuccessToast, successMessage } = {}
) =>
  commsRequest({
    method: "PATCH",
    path,
    body,
    headers,
    baseUrl,
    showSuccessToast,
    successMessage,
  });

export const commsDelete = (
  path,
  { headers, baseUrl, showSuccessToast, successMessage } = {}
) =>
  commsRequest({
    method: "DELETE",
    path,
    headers,
    baseUrl,
    showSuccessToast,
    successMessage,
  });

export default {
  request: commsRequest,
  get: commsGet,
  post: commsPost,
  put: commsPut,
  patch: commsPatch,
  delete: commsDelete,
};
