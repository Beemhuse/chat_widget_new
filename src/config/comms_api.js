import comms from "./comms_config";

// Generic CRUD helpers built on top of comms_config

export const createResource = (
  path,
  payload,
  { successMessage, headers, baseUrl } = {}
) =>
  comms.post(path, payload, {
    headers,
    baseUrl,
    showSuccessToast: Boolean(successMessage),
    successMessage,
  });

export const readResource = (path, { query, headers, baseUrl } = {}) =>
  comms.get(path, { query, headers, baseUrl });

export const updateResource = (
  path,
  payload,
  { successMessage, headers, baseUrl } = {}
) =>
  comms.put(path, payload, {
    headers,
    baseUrl,
    showSuccessToast: Boolean(successMessage),
    successMessage,
  });

export const patchResource = (
  path,
  payload,
  { successMessage, headers, baseUrl } = {}
) =>
  comms.patch(path, payload, {
    headers,
    baseUrl,
    showSuccessToast: Boolean(successMessage),
    successMessage,
  });

export const deleteResource = (
  path,
  { successMessage, headers, baseUrl } = {}
) =>
  comms.delete(path, {
    headers,
    baseUrl,
    showSuccessToast: Boolean(successMessage),
    successMessage,
  });

export default {
  create: createResource,
  read: readResource,
  update: updateResource,
  patch: patchResource,
  delete: deleteResource,
};
