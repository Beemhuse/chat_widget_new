import COMMS_ENDPOINTS from "./COMMS_ENDPOINTS";
import api from "./comms_api";

// HEALTH
export const health = {
  basic: () => api.read(COMMS_ENDPOINTS.HEALTH.BASIC.PATH),
  db: () => api.read(COMMS_ENDPOINTS.HEALTH.DB.PATH),
  detailed: () => api.read(COMMS_ENDPOINTS.HEALTH.DETAILED.PATH),
};

// SUPER ADMIN
export const superAdmin = {
  listAdmins: () => api.read(COMMS_ENDPOINTS.SUPER_ADMIN.LIST_ADMINS.PATH),
  registerAdmin: (payload, opts) =>
    api.create(COMMS_ENDPOINTS.SUPER_ADMIN.REGISTER_ADMIN.PATH, payload, opts),
  resetPassword: (payload, opts) =>
    api.create(COMMS_ENDPOINTS.SUPER_ADMIN.RESET_PASSWORD.PATH, payload, opts),
};

// ADMIN
export const admin = {
  login: (payload, opts) =>
    api.create(COMMS_ENDPOINTS.ADMIN.LOGIN.PATH, payload, opts),
  changePassword: (payload, opts) =>
    api.update(COMMS_ENDPOINTS.ADMIN.CHANGE_PASSWORD.PATH, payload, opts),
  rooms: () => api.read(COMMS_ENDPOINTS.ADMIN.ROOMS.PATH),
};

// API KEYS
export const apiKeys = {
  list: () => api.read(COMMS_ENDPOINTS.API_KEYS.LIST.PATH),
  create: (payload, opts) =>
    api.create(COMMS_ENDPOINTS.API_KEYS.CREATE.PATH, payload, opts),
  getById: (id) => api.read(COMMS_ENDPOINTS.API_KEYS.GET_BY_ID.PATH(id)),
  update: (id, payload, opts) =>
    api.update(COMMS_ENDPOINTS.API_KEYS.UPDATE.PATH(id), payload, opts),
  delete: (id, opts) =>
    api.delete(COMMS_ENDPOINTS.API_KEYS.DELETE.PATH(id), opts),
  toggle: (id, payload, opts) =>
    api.update(COMMS_ENDPOINTS.API_KEYS.TOGGLE.PATH(id), payload, opts),
};

// ROOMS
export const rooms = {
  create: (payload, opts) =>
    api.create(COMMS_ENDPOINTS.ROOMS.CREATE.PATH, payload, opts),
  update: (roomId, payload, opts) =>
    api.update(COMMS_ENDPOINTS.ROOMS.UPDATE.PATH(roomId), payload, opts),
  delete: (roomId, opts) =>
    api.delete(COMMS_ENDPOINTS.ROOMS.DELETE.PATH(roomId), opts),
  get: (roomId) => api.read(COMMS_ENDPOINTS.ROOMS.GET.PATH(roomId)),
  join: (roomId, payload, opts) =>
    api.create(COMMS_ENDPOINTS.ROOMS.JOIN.PATH(roomId), payload, opts),
  leave: (roomId, payload, opts) =>
    api.create(COMMS_ENDPOINTS.ROOMS.LEAVE.PATH(roomId), payload, opts),
};

export default {
  health,
  superAdmin,
  admin,
  apiKeys,
  rooms,
};
