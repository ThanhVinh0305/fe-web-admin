import React from 'react';
import { useAuth } from '../hooks/index.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  const activeKeywords = 0;
  const activeSchedules = 0;
  const processingTasks = 0;
  const completedToday = 0;

  const quickActions = [
    {
      title: 'Quản lý từ khóa/URL',
      description: 'Cấu hình từ khóa và URL cho BOT thu thập dữ liệu',
      href: '/keywords',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
      color: 'bg-purple-500'
    },
    {
      title: 'Lịch BOT',
      description: 'Tạo và quản lý lịch chạy tự động cho các BOT',
      href: '/schedules',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      title: 'Giám sát Task',
      description: 'Theo dõi real-time các task BOT đang thực thi',
      href: '/tasks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-pink-500'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Chào mừng {user?.name} đến với <span className="font-semibold text-purple-600">ABP BOT Management System</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">URL BOT đang hoạt động</p>
                <p className="text-2xl font-semibold text-gray-900">{activeKeywords}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">BOT đang chạy</p>
                <p className="text-2xl font-semibold text-gray-900">{activeSchedules}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Task đang thực thi</p>
                <p className="text-2xl font-semibold text-gray-900">{processingTasks}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoàn thành hôm nay</p>
                <p className="text-2xl font-semibold text-gray-900">{completedToday}</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <a href={action.href} className="block p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                      {action.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </a>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Hoạt động gần đây
            </h3>
            <div className="space-y-3">
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có hoạt động nào gần đây</p>
                <p className="text-sm mt-2">Dữ liệu sẽ được cập nhật khi có hoạt động mới</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm">
                <a href="/tasks" className="flex items-center">
                  Xem tất cả
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Trạng thái hệ thống
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Server</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                    Hoạt động
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                    Hoạt động
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Queue System</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                    Hoạt động
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Hướng dẫn sử dụng
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Từ khóa/URL:</strong> Cấu hình URL và từ khóa cho BOT crawl dữ liệu</p>
                <p>• <strong>Lịch BOT:</strong> Thiết lập lịch chạy tự động cho từng BOT</p>
                <p>• <strong>Giám sát Task:</strong> Theo dõi real-time tiến độ và kết quả BOT</p>
                <p>• <strong>Người dùng:</strong> Quản lý tài khoản và phân quyền hệ thống</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;