export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('vi-VN', { ...defaultOptions, ...options });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+84|84|0)[3-9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
    }
  },
};

// ============================================
// Token Management Utilities
// ============================================

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // Token expiry time in seconds, convert to milliseconds
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Get token expiry time in readable format
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiry date or null if invalid
 */
export const getTokenExpiryDate = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiry date:', error);
    return null;
  }
};

/**
 * Get remaining time until token expires
 * @param {string} token - JWT token
 * @returns {number} - Remaining time in milliseconds, 0 if expired
 */
export const getTokenRemainingTime = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return 0;
    
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const remaining = expiryTime - currentTime;
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.error('Error getting token remaining time:', error);
    return 0;
  }
};

/**
 * Check if token will expire soon (within specified minutes)
 * @param {string} token - JWT token
 * @param {number} minutes - Minutes threshold (default: 5)
 * @returns {boolean} - True if expiring soon
 */
export const isTokenExpiringSoon = (token, minutes = 5) => {
  try {
    const remaining = getTokenRemainingTime(token);
    const threshold = minutes * 60 * 1000; // Convert to milliseconds
    
    return remaining > 0 && remaining <= threshold;
  } catch (error) {
    console.error('Error checking if token expiring soon:', error);
    return false;
  }
};

/**
 * Validate token from localStorage
 * @returns {boolean} - True if token exists and is valid
 */
export const isValidToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    return !isTokenExpired(token);
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};