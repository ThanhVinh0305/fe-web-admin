import React, { useEffect, useState, useRef, useCallback } from 'react';
import Toast from './Toast.jsx';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const shownMessages = useRef(new Set()); // Track messages đã hiển thị

  const addToast = useCallback((message, type = 'info') => {
    // Tạo unique key cho message
    const messageKey = `${type}-${message}`;
    
    // Nếu message này đã được hiển thị trong vòng 3 giây, bỏ qua
    if (shownMessages.current.has(messageKey)) {
      return;
    }
    
    // Đánh dấu message đã hiển thị
    shownMessages.current.add(messageKey);
    
    // Tự động xóa khỏi set sau 3 giây
    setTimeout(() => {
      shownMessages.current.delete(messageKey);
    }, 3000);
    
    const id = Date.now() + Math.random(); // Thêm random để tránh trùng ID
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    // Lắng nghe các event từ API client
    const handleTokenExpired = (event) => {
      addToast(event.detail.message || 'Phiên đăng nhập đã hết hạn', 'error');
    };

    const handleUnauthorized = (event) => {
      addToast(event.detail.message || 'Bạn không có quyền thực hiện thao tác này', 'warning');
    };

    const handleServerError = (event) => {
      addToast(event.detail.message || 'Có lỗi xảy ra từ server', 'error');
    };

    window.addEventListener('token-expired', handleTokenExpired);
    window.addEventListener('unauthorized-action', handleUnauthorized);
    window.addEventListener('server-error', handleServerError);

    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
      window.removeEventListener('unauthorized-action', handleUnauthorized);
      window.removeEventListener('server-error', handleServerError);
    };
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
