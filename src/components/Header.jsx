import React from 'react';
import { useAuth } from '../hooks/index.js';
import Button from './ui/Button.jsx';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Web Admin
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Dashboard
            </a>
            <a href="/keywords" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Từ khóa/URL
            </a>
            <a href="/schedules" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Lịch chạy
            </a>
            <a href="/tasks" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Quản lý Task
            </a>
            <a href="/users" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Người dùng
            </a>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  Xin chào, {user?.name}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
                  Đăng nhập
                </a>
                <a href="/register" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
                  Đăng ký
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;