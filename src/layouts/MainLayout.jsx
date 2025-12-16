import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/index.js';
import Button from '../components/ui/Button.jsx';
import logoImg from '../image/abp copy.png';           // <-- LOGO FULL
import logoSmallImg from '../image/abp-small copy.png'; // <-- LOGO NHỎ
import watermarkImg from '../image/abp-watermark copy.png'; // <-- IMPORT WATERMARK

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Tổng quan',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Từ khóa',
      path: '/keywords',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    {
      name: 'URL',
      path: '/urls',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      name: 'Lịch BOT',
      path: '/schedules',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Giám sát Task',
      path: '/tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const isActive = (path) => location.pathname === path;

  // NAV style constants - dễ chỉnh khi cần đổi màu
  const NAV_STYLES = {
    // hover (non-active) classes: use semi-transparent white on hover
    hoverClass: 'text-gray-300 hover:bg-white/20 hover:text-white',
    hoverHex: '#ffffff33', // semi-transparent white (~20% alpha)
    // active (selected) classes: use same semi-transparent white (matches hover)
    activeClass: 'bg-white/20 text-white shadow-lg',
    activeHex: '#ffffff33', // semi-transparent white (~20% alpha)
    activeShadowHex: '#ffffff33', // use semi-transparent white for shadow reference
  };

  // layout color requested by user
  const layoutColor = '#F9FAFB';

  return (
    <div className="flex h-screen relative" style={{ backgroundColor: layoutColor }}>
 
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl relative`}
        style={{ backgroundColor: '#764ecd ' }} // thay màu sidebar ở đây
      >
        
        {/* LOGO */}
        <div className="flex items-center justify-center p-4 border-b border-gray-700">
          {sidebarOpen ? (
            <img
              src={logoImg}           // ảnh full logo
              alt="ABP Logo"
              className="w-full max-w-[170px] object-contain mx-auto"
            />
          ) : (
            <img
              src={logoSmallImg}      // ảnh nhỏ chỉ icon
              alt="ABP Icon"
              className="w-10 h-10 object-contain mx-auto"
            />
          )}
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path) ? NAV_STYLES.activeClass : NAV_STYLES.hoverClass
                }`}
              >
                <span className={sidebarOpen ? '' : 'mx-auto'}>{item.icon}</span>
                {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              </button>
            ))}
          </div>
        </nav>

{/* WATERMARK */}
    {sidebarOpen && (
    <div className="flex justify-center py-2 w-full" style={{ height: '25vh' }}>
    <img
      src={watermarkImg}
      alt="Watermark"
      className="w-full h-full object-contain"
      style={{ userSelect: 'none', pointerEvents: 'none', opacity: 0.2 }} // opacity giảm xuống 0.2
    />
  </div>
)}

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium text-sm">Đăng xuất</span>}
          </button>
        </div>

        {/* SIDEBAR TOGGLE BUTTON */}
    <button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="
    absolute top-1/2 -translate-y-1/2 
    right-[-14px]
    w-10 h-10 bg-white
    shadow-xl rounded-xl 
    flex items-center justify-center 
    border border-gray-300
    hover:bg-gray-100 
    transition-all
    text-[#764ecd]" 
>
  {sidebarOpen ? (
    <svg className="w-5 h-5" fill="none" stroke="#764ecd" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="#764ecd" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )}
</button>

      </aside>


      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: layoutColor }}>
           <div className="flex items-center justify-between px-6 py-4">

            {/* PAGE TITLE */}
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>

            {/* RIGHT HEADER */}
            <div className="flex items-center space-x-6">

              {/* Date Picker */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 font-medium">Thời gian:</span>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none cursor-pointer bg-white"
                />
              </div>

             
              
              {/* Bell Icon */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: layoutColor }}>
           <div className="max-w-7xl mx-auto">{children}</div>
         </main>

        {/* FOOTER */}
        <footer className="border-t border-gray-200 py-3 px-6" style={{ backgroundColor: layoutColor }}>
           <div className="flex items-center justify-between text-sm text-gray-500">
             <p>© 2025 <span className="font-semibold text-purple-600">ABP Corporation</span>. All rights reserved.</p>
             <div className="flex items-center space-x-4">
               <span className="text-xs text-gray-400">BOT Management System v1.0</span>
               <a href="#" className="hover:text-purple-600 transition-colors">Trợ giúp</a>
               <a href="#" className="hover:text-purple-600 transition-colors">API Docs</a>
             </div>
           </div>
         </footer>

       </div>
     </div>
   );
 };

 export default MainLayout;
