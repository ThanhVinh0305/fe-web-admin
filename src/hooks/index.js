import { useState, useEffect } from 'react';
import { authService } from '../services/index.js';
import { isValidToken, isTokenExpiringSoon } from '../utils/helpers.js';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Kiểm tra xem token có còn hợp lệ không
      if (isValidToken()) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Setup auto logout khi token sắp hết hạn
        setupTokenExpiryCheck(token);
      } else {
        // Token đã hết hạn, xóa và logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Setup interval để kiểm tra token sắp hết hạn
  const setupTokenExpiryCheck = (token) => {
    // Kiểm tra mỗi 60 giây
    const checkInterval = setInterval(() => {
      if (isTokenExpiringSoon(token, 5)) {
        console.warn('Token will expire soon. Consider refreshing...');
        // Có thể tự động refresh token ở đây nếu backend hỗ trợ
        // hoặc hiển thị thông báo cho user
      }
      
      if (!isValidToken()) {
        // Token đã hết hạn
        clearInterval(checkInterval);
        handleTokenExpiry();
      }
    }, 60000); // Check every 60 seconds

    // Cleanup interval khi component unmount
    return () => clearInterval(checkInterval);
  };

  const handleTokenExpiry = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('token-expired', { 
      detail: { message: 'Phiên đăng nhập đã hết hạn' } 
    }));
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setUser(result.data.user);
        
        // Setup token expiry check cho token mới
        const token = localStorage.getItem('token');
        if (token) {
          setupTokenExpiryCheck(token);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.data.user);
        
        // Setup token expiry check cho token mới
        const token = localStorage.getItem('token');
        if (token) {
          setupTokenExpiryCheck(token);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };
};export const useForm = (initialValues, validationSchema, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validationSchema) {
      try {
        validationSchema.validateAt(name, values);
        setErrors(prev => ({ ...prev, [name]: '' }));
      } catch (error) {
        setErrors(prev => ({ ...prev, [name]: error.message }));
      }
    }
  };

  const validate = () => {
    if (!validationSchema) return true;

    try {
      validationSchema.validateSync(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
    }
  };

  return [storedValue, setValue];
};

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};