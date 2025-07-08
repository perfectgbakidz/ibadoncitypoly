
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import AdminDashboardPage from './pages/DashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage'; // New Import
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage'; // New Import
import BorrowReturnPage from './pages/BorrowReturnPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      <Route 
        path="/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'student']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />} />
                
                {/* Shared Routes */}
                <Route path="/books" element={<ProtectedRoute allowedRoles={['admin', 'student']}><BooksPage /></ProtectedRoute>} />
                <Route path="/books/:id" element={<ProtectedRoute allowedRoles={['admin', 'student']}><BookDetailPage /></ProtectedRoute>} />
                <Route path="/borrow-return" element={<ProtectedRoute allowedRoles={['admin', 'student']}><BorrowReturnPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'student']}><ProfileSettingsPage /></ProtectedRoute>} />
                <Route path="/privacy" element={<ProtectedRoute allowedRoles={['admin', 'student']}><PrivacyPolicyPage /></ProtectedRoute>} />
                <Route path="/terms" element={<ProtectedRoute allowedRoles={['admin', 'student']}><TermsPage /></ProtectedRoute>} />

                {/* User Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><UserDashboardPage /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><UserDetailPage /></ProtectedRoute>} />

                {/* Redirect any other paths */}
                <Route path="*" element={<Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};


const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;