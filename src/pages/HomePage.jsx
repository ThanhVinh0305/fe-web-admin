import React from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import { Card, Button } from '../components/ui/index.js';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chào mừng đến với Web Admin
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Hệ thống quản lý toàn diện với giao diện hiện đại
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" size="lg">
              Bắt đầu
            </Button>
            <Button variant="outline" size="lg">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Quản lý người dùng" className="text-center">
            <div className="mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600">
              Quản lý thông tin người dùng, phân quyền và bảo mật
            </p>
          </Card>

          <Card title="Quản lý nội dung" className="text-center">
            <div className="mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600">
              Tạo, chỉnh sửa và quản lý nội dung website
            </p>
          </Card>

          <Card title="Thống kê & Báo cáo" className="text-center">
            <div className="mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600">
              Theo dõi hiệu suất và tạo báo cáo chi tiết
            </p>
          </Card>
        </div>

        <Card title="Thao tác nhanh">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm người dùng
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Tạo bài viết
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Xem báo cáo
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;