/**
 * API Service — centralized communication layer between React frontend and Express backend.
 * All API calls go through here to ensure consistent error handling and auth header injection.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3300/v1';

// ────────────────────────────── Core request helper ──────────────────────────────

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  // Handle 204 No Content
  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// ────────────────────────────── Auth API ──────────────────────────────

export const loginUser = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (name, email, password, confirmPassword) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

export const verifyOtp = (email, otp) =>
  request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const resendOtp = (email, purpose = 'emailVerification') =>
  request('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
  });

export const logoutUser = (refreshToken) =>
  request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

export const refreshTokens = (refreshToken) =>
  request('/auth/refresh-tokens', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

export const forgotPasswordUser = (email) =>
  request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const verifyResetOtp = (email, otp) =>
  request('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const resetPasswordUser = (email, resetToken, password, confirmPassword) =>
  request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, resetToken, password, confirmPassword }),
  });

// ────────────────────────────── User API ──────────────────────────────

export const getMe = () => request('/users/me');

export const updateMe = (data) =>
  request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getUsers = (limit = 20, skip = 0) =>
  request(`/users?limit=${limit}&skip=${skip}`);

export const updateUserRole = (userId, roles) =>
  request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ roles }),
  });

export const deleteUserAPI = (userId) =>
  request(`/users/${userId}`, { method: 'DELETE' });

// ────────────────────────────── Projects API ──────────────────────────────

export const fetchProjects = (limit = 20, skip = 0) =>
  request(`/projects?limit=${limit}&skip=${skip}`);

export const fetchProjectById = (projectId) =>
  request(`/projects/${projectId}`);

export const createProject = (projectData) =>
  request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });

export const updateProject = (projectId, projectData) =>
  request(`/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(projectData),
  });

export const deleteProject = (projectId) =>
  request(`/projects/${projectId}`, { method: 'DELETE' });

// ────────────────────────────── Dashboard API ──────────────────────────────

export const getDashboardStats = () => request('/dashboard/stats');

export const getNotifications = () => request('/dashboard/notifications');

export const markNotificationRead = (id) =>
  request(`/dashboard/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  request('/dashboard/notifications/read-all', { method: 'PATCH' });

export const getActivityLogs = (limit = 30) =>
  request(`/dashboard/activity-logs?limit=${limit}`);
