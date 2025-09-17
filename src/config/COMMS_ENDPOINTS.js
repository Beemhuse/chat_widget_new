// COMMUNICATIONS INFRASTRUCTURE DASHBOARD API ENDPOINTS

const COMMS_ENDPOINTS = {
  HEALTH: {
    BASIC: {
      METHOD: "GET",
      PATH: "/api/health",
      DESCRIPTION: "BASIC HEALTH CHECK",
    },
    DB: {
      METHOD: "GET",
      PATH: "/api/health/db",
      DESCRIPTION: "DATABASE HEALTH CHECK",
    },
    DETAILED: {
      METHOD: "GET",
      PATH: "/api/health/detailed",
      DESCRIPTION: "DETAILED HEALTH CHECK",
    },
  },

  SUPER_ADMIN: {
    LIST_ADMINS: {
      METHOD: "GET",
      PATH: "/api/super-admin/admins",
      DESCRIPTION: "LIST ALL ADMIN USERS",
    },
    REGISTER_ADMIN: {
      METHOD: "POST",
      PATH: "/api/super-admin/register",
      DESCRIPTION: "REGISTER A NEW ADMIN USER",
    },
    RESET_PASSWORD: {
      METHOD: "POST",
      PATH: "/api/super-admin/reset-password",
      DESCRIPTION: "RESET ADMIN USER PASSWORD",
    },
  },

  ADMIN: {
    LOGIN: {
      METHOD: "POST",
      PATH: "/api/admin/login",
      DESCRIPTION: "ADMIN USER LOGIN",
    },
    CHANGE_PASSWORD: {
      METHOD: "PUT",
      PATH: "/api/admin/change-password",
      DESCRIPTION: "CHANGE ADMIN PASSWORD",
    },
    ROOMS: {
      METHOD: "GET",
      PATH: "/api/admin/rooms",
      DESCRIPTION: "GET ADMIN'S ROOMS",
    },
  },

  API_KEYS: {
    LIST: {
      METHOD: "GET",
      PATH: "/api/api-keys",
      DESCRIPTION: "LIST ADMIN'S API KEYS",
    },
    CREATE: {
      METHOD: "POST",
      PATH: "/api/api-keys",
      DESCRIPTION: "CREATE NEW API KEY",
    },
    GET_BY_ID: {
      METHOD: "GET",
      PATH: (id) => `/api/api-keys/${id}`,
      DESCRIPTION: "GET API KEY BY ID",
    },
    UPDATE: {
      METHOD: "PUT",
      PATH: (id) => `/api/api-keys/${id}`,
      DESCRIPTION: "UPDATE API KEY",
    },
    DELETE: {
      METHOD: "DELETE",
      PATH: (id) => `/api/api-keys/${id}`,
      DESCRIPTION: "DELETE API KEY",
    },
    TOGGLE: {
      METHOD: "PUT",
      PATH: (id) => `/api/api-keys/${id}/toggle`,
      DESCRIPTION: "TOGGLE API KEY ACTIVE STATUS",
    },
  },

  ROOMS: {
    CREATE: {
      METHOD: "POST",
      PATH: "/api/room/create",
      DESCRIPTION: "CREATE A NEW ROOM",
    },
    UPDATE: {
      METHOD: "PUT",
      PATH: (roomId) => `/api/room/${roomId}`,
      DESCRIPTION: "UPDATE ROOM DETAILS",
    },
    DELETE: {
      METHOD: "DELETE",
      PATH: (roomId) => `/api/room/${roomId}`,
      DESCRIPTION: "DELETE ROOM",
    },
    GET: {
      METHOD: "GET",
      PATH: (roomId) => `/api/room/${roomId}`,
      DESCRIPTION: "GET ROOM DATA",
    },
    JOIN: {
      METHOD: "POST",
      PATH: (roomId) => `/api/room/${roomId}/join`,
      DESCRIPTION: "JOIN A ROOM",
    },
    LEAVE: {
      METHOD: "POST",
      PATH: (roomId) => `/api/room/${roomId}/leave`,
      DESCRIPTION: "LEAVE A ROOM",
    },
  },
};

export default COMMS_ENDPOINTS;
