import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpVerificationPage from './pages/auth/OtpVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardUsers from './pages/dashboard/DashboardUsers';
import DashboardProjects from './pages/dashboard/DashboardProjects';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardNotifications from './pages/dashboard/DashboardNotifications';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
import DashboardFiles from './pages/dashboard/DashboardFiles';
import DashboardMessages from './pages/dashboard/DashboardMessages';
import DashboardMeetings from './pages/dashboard/DashboardMeetings';
import DashboardContactMessages from './pages/dashboard/DashboardContactMessages';
import MeetingRoom from './pages/dashboard/MeetingRoom';

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/project/:slug" element={<ProjectDetailPage />} />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-otp" element={<OtpVerificationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Dashboard Routes — protection handled inside DashboardLayout */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="users" element={<DashboardUsers />} />
                  <Route path="projects" element={<DashboardProjects />} />
                  <Route path="analytics" element={<DashboardAnalytics />} />
                  <Route path="notifications" element={<DashboardNotifications />} />
                  <Route path="messages" element={<DashboardMessages />} />
                  <Route path="meetings" element={<DashboardMeetings />} />
                  <Route path="meeting/:meetingId" element={<MeetingRoom />} />
                  <Route path="contact-messages" element={<DashboardContactMessages />} />
                  <Route path="files" element={<DashboardFiles />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>
              </Routes>
            </Router>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
</ErrorBoundary>
  );
};

export default App;
