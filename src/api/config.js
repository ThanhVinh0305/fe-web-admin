export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },
  
  POSTS: {
    LIST: '/posts',
    CREATE: '/posts',
    GET: (id) => `/posts/${id}`,
    UPDATE: (id) => `/posts/${id}`,
    DELETE: (id) => `/posts/${id}`,
  },
  
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET: (id) => `/categories/${id}`,
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },
  
  KEYWORDS: {
    FILTER: '/keyword/filter',
    CREATE: '/keyword/create',
    UPDATE: (id) => `/keyword/update/${id}`,
    DELETE: (id) => `/keyword/delete/${id}`,
    TOGGLE_STATUS: (id) => `/keyword/toggle-status/${id}`,
  },

  SCHEDULE: {
    FILTER: '/schedule/filter',
    CREATE: '/schedule/create',
    UPDATE: (id) => `/schedule/update/${id}`,
    DELETE: (id) => `/schedule/delete/${id}`,
  },
  
  TASK: {
    SEND_DATA_SOURCE: '/task/send-data-source',
    SEND_DATA_KEYWORD: '/task/send-data-keyword',
    FILTER: '/task/keyword/filter',
    CREATE: '/task/create-keyword-task',
    UPDATE: (id) => `/task/update/${id}`,
    DELETE: (id) => `/task/delete/${id}`,
  },
  
  SOURCE: {
    FILTER: '/source/filter',
    CREATE: '/source/create',
    UPDATE: (id) => `/source/update/${id}`,
    DELETE: (id) => `/source/delete/${id}`,
    TOGGLE_STATUS: (id) => `/source/toggle-status/${id}`,
  },
  
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
  },
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};