import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/index.js';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import KeywordsPage from './pages/KeywordsPage.jsx';
import URLsPage from './pages/URLsPage.jsx';
import SchedulesPage from './pages/SchedulesPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import Loading from './components/ui/Loading.jsx';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect về dashboard
  if (isAuthenticated && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = window.location;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    // Lưu URL hiện tại để redirect lại sau khi đăng nhập
    const currentPath = location.pathname + location.search;
    const redirectUrl = currentPath !== '/login' ? `/login?redirect=${encodeURIComponent(currentPath)}` : '/login';
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Nếu đã đăng nhập → Dashboard
  // Nếu chưa đăng nhập → Login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes - Không cần đăng nhập */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          
          {/* Protected Routes - BẮT BUỘC phải đăng nhập */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/keywords" element={<ProtectedRoute><KeywordsPage /></ProtectedRoute>} />
          <Route path="/urls" element={<ProtectedRoute><URLsPage /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
