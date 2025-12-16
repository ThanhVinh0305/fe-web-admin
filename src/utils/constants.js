export const API_MESSAGES = {
  SUCCESS: 'Thành công',
  ERROR: 'Có lỗi xảy ra',
  UNAUTHORIZED: 'Không có quyền truy cập',
  NOT_FOUND: 'Không tìm thấy',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
};

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  USER: 'user',
  GUEST: 'guest',
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  EMAIL_INVALID: 'Email không hợp lệ',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 6 ký tự',
  PHONE_INVALID: 'Số điện thoại không hợp lệ',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
};

export const APP_CONFIG = {
  NAME: 'Web Admin',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  ITEMS_PER_PAGE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};