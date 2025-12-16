import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag để tránh redirect nhiều lần
let isRedirecting = false;

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý 401 - Token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401) {
      // Kiểm tra xem có phải là request refresh token không
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Nếu refresh token fail, logout user
        handleTokenExpiry('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return Promise.reject(error);
      }

      // Nếu chưa retry và có refresh token
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            // Thử refresh token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: refreshToken
            });

            if (response.data && response.data.token) {
              // Lưu token mới
              localStorage.setItem('token', response.data.token);
              if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
              }

              // Retry request gốc với token mới
              originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token thất bại
            handleTokenExpiry('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return Promise.reject(refreshError);
          }
        } else {
          // Không có refresh token
          handleTokenExpiry('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
      
      return Promise.reject(error);
    }
    
    // Xử lý 403 - Không có quyền truy cập -> Redirect về login
    if (error.response?.status === 403) {
      console.error('Không có quyền truy cập:', error.response.data);
      handleTokenExpiry(); // Redirect về login mà không hiển thị toast
    }
    
    // Xử lý lỗi server 500+
    if (error.response?.status >= 500) {
      console.error('Lỗi server:', error.response.data);
      // Chỉ log console, không hiển thị toast
    }
    
    return Promise.reject(error);
  }
);

// Xử lý token hết hạn
function handleTokenExpiry(message = 'Phiên đăng nhập đã hết hạn') {
  if (isRedirecting) return;
  
  isRedirecting = true;
  
  // Xóa dữ liệu authentication
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Lưu URL hiện tại để redirect sau khi login (không dispatch event cho toast)
  const currentPath = window.location.pathname;
  const shouldSaveRedirect = currentPath !== '/login' && currentPath !== '/register';
  
  // Redirect ngay lập tức về login
  if (shouldSaveRedirect) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  } else {
    window.location.href = '/login';
  }
  
  // Reset flag sau 2 giây để allow redirect mới
  setTimeout(() => {
    isRedirecting = false;
  }, 2000);
}

export default apiClient;