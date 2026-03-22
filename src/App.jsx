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

/**
 * 🚀 High-Reliability Lazy Loading
 * Catches 'Failed to fetch dynamically imported module' errors which happen
 * when a user's browser has an old manifest after a new deployment.
 */
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenForceRefreshed = sessionStorage.getItem('page-has-been-force-refreshed');
    try {
      const component = await componentImport();
      sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenForceRefreshed || pageHasBeenForceRefreshed === 'false') {
        sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error; // Re-throw if refresh didn't fix it
    }
  });

// ─── Public Pages ─────────────────────────────────────────────
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const ProjectDetailPage = lazyWithRetry(() => import('./pages/ProjectDetailPage'));

// ─── Auth Pages ───────────────────────────────────────────────
const LoginPage = lazyWithRetry(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/auth/RegisterPage'));
const OtpVerificationPage = lazyWithRetry(() => import('./pages/auth/OtpVerificationPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/auth/ResetPasswordPage'));

// ─── Dashboard Pages ──────────────────────────────────────────
const DashboardOverview = lazyWithRetry(() => import('./pages/dashboard/DashboardOverview'));
const DashboardUsers = lazyWithRetry(() => import('./pages/dashboard/DashboardUsers'));
const DashboardProjects = lazyWithRetry(() => import('./pages/dashboard/DashboardProjects'));
const DashboardSettings = lazyWithRetry(() => import('./pages/dashboard/DashboardSettings'));
const DashboardNotifications = lazyWithRetry(() => import('./pages/dashboard/DashboardNotifications'));
const DashboardAnalytics = lazyWithRetry(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardFiles = lazyWithRetry(() => import('./pages/dashboard/DashboardFiles'));
const DashboardMessages = lazyWithRetry(() => import('./pages/dashboard/DashboardMessages'));
const DashboardMeetings = lazyWithRetry(() => import('./pages/dashboard/DashboardMeetings'));
const DashboardContactMessages = lazyWithRetry(() => import('./pages/dashboard/DashboardContactMessages'));
const MeetingRoom = lazyWithRetry(() => import('./pages/dashboard/MeetingRoom'));

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
