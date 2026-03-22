import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

// ─── Shared Layouts ──────────────────────────────────────────
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// ─── Public Pages (Lazy) ──────────────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));

// ─── Auth Pages (Lazy) ────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('./pages/auth/OtpVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// ─── Dashboard Pages (Lazy) ───────────────────────────────────
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const DashboardUsers = lazy(() => import('./pages/dashboard/DashboardUsers'));
const DashboardProjects = lazy(() => import('./pages/dashboard/DashboardProjects'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const DashboardNotifications = lazy(() => import('./pages/dashboard/DashboardNotifications'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardFiles = lazy(() => import('./pages/dashboard/DashboardFiles'));
const DashboardMessages = lazy(() => import('./pages/dashboard/DashboardMessages'));
const DashboardMeetings = lazy(() => import('./pages/dashboard/DashboardMeetings'));
const DashboardContactMessages = lazy(() => import('./pages/dashboard/DashboardContactMessages'));
const MeetingRoom = lazy(() => import('./pages/dashboard/MeetingRoom'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <Router>
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
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
