import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/forms/LoginForm.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Kiểm tra xem có phải do session expired không
  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      setSessionExpired(true);
      // Auto hide sau 5 giây
      setTimeout(() => setSessionExpired(false), 5000);
    }
  }, [searchParams]);

  const handleLoginSuccess = async (data) => {
    // Lấy redirect URL từ query params
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    
    setTimeout(() => {
      navigate(redirectUrl, { replace: true });
    }, 300);
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Session Expired Alert */}
        {sessionExpired && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <Alert type="warning">
              ⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. 
            </Alert>
          </div>
        )}

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            <span className="text-purple-600">ABP</span> BOT Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hệ thống quản lý và giám sát các BOT tự động
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div>
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          </div>

          {/* Demo Credentials */}
          <div>
            <Card>
              <div className="p-6">
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-900 mb-2">
                    🤖 Tính năng hệ thống BOT
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Quản lý từ khóa/URL cho BOT crawl</li>
                    <li>• Lập lịch tự động cho các BOT</li>
                    <li>• Giám sát real-time task đang chạy</li>
                    <li>• Lịch sử và báo cáo chi tiết</li>
                    <li>• Dashboard tổng quan hiệu suất</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>


      </div>
    </div>
  );
};

export default LoginPage;