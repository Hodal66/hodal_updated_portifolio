/**
 * API Service — centralized communication layer between React frontend and Express backend.
 * All API calls go through here to ensure consistent error handling and auth header injection.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hodal-new-portfolio-bn.onrender.com/v1';

// ────────────────────────────── Core request helper ──────────────────────────────

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    // Preserve all additional fields from the response (e.g., requiresVerification, email)
    Object.assign(error, data);
    throw error;
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

export const updateAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return request('/users/me/avatar', {
    method: 'PATCH',
    body: formData,
  });
};

export const getUsers = (limit = 20, skip = 0, search = '') => {
  const searchParam = search ? `&search=${search}` : '';
  return request(`/users?limit=${limit}&skip=${skip}${searchParam}`);
};

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

export const uploadProjectImage = (projectId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return request(`/projects/${projectId}/image`, {
    method: 'PATCH',
    body: formData,
  });
};

// ────────────────────────────── Dashboard API ──────────────────────────────

export const getDashboardStats = () => request('/dashboard/stats');

export const getNotifications = () => request('/dashboard/notifications');

export const markNotificationRead = (id) =>
  request(`/dashboard/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  request('/dashboard/notifications/read-all', { method: 'PATCH' });

export const getActivityLogs = (limit = 30) =>
  request(`/dashboard/activity-logs?limit=${limit}`);

// ────────────────────────────── Messaging API ──────────────────────────────

export const submitContactForm = (data) =>
  request('/messages/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getInboxes = () => request('/messages/conversations');

export const startConversation = (recipientId) =>
  request('/messages/conversations', {
    method: 'POST',
    body: JSON.stringify({ recipientId }),
  });

export const getConversationDetails = (conversationId, limit = 50, skip = 0) =>
  request(`/messages/conversations/${conversationId}?limit=${limit}&skip=${skip}`);

export const markConversationAsRead = (conversationId) =>
  request(`/messages/conversations/${conversationId}/read`, { method: 'PATCH' });

export const sendNewMessage = (conversationId, content, recipientId, attachments) =>
  request('/messages/send', {
    method: 'POST',
    body: JSON.stringify({ conversationId, content, recipientId, attachments }),
  });

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request('/messages/upload', {
    method: 'POST',
    body: formData,
  });
};

export const getAdminContactMessages = (limit = 20, skip = 0, status) => {
  const statusParam = status ? `&status=${status}` : '';
  return request(`/messages/admin/contact-messages?limit=${limit}&skip=${skip}${statusParam}`);
};

export const updateContactStatus = (id, status) =>
  request(`/messages/admin/contact-messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ────────────────────────────── Meetings API ──────────────────────────────

export const scheduleMeeting = (meetingData) =>
  request('/meetings/schedule', {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });

export const getMyMeetings = () => request('/meetings/my-meetings');

export const getMeeting = (meetingId) => request(`/meetings/${meetingId}`);

export const updateMeetingStatus = (meetingId, status) =>
  request(`/meetings/${meetingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const joinMeetingAPI = (meetingId) =>
  request(`/meetings/${meetingId}/join`, { method: 'POST' });

export const leaveMeetingAPI = (meetingId) =>
  request(`/meetings/${meetingId}/leave`, { method: 'POST' });

export const endMeetingAPI = (meetingId) =>
  request(`/meetings/${meetingId}/end`, { method: 'POST' });

export const getMeetingParticipants = (meetingId) =>
  request(`/meetings/${meetingId}/participants`);

export const getMeetingMessages = (meetingId, limit = 100, skip = 0) =>
  request(`/meetings/${meetingId}/messages?limit=${limit}&skip=${skip}`);

export const sendMeetingMessage = (meetingId, content, type = 'text', fileUrl, fileName) =>
  request(`/meetings/${meetingId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, type, fileUrl, fileName }),
  });

export const getMeetingHistory = () => request('/meetings/history');

// ────────────────────────────── Calls API ──────────────────────────────

export const startCall = (receiverId, type = 'voice') =>
  request('/calls/start', {
    method: 'POST',
    body: JSON.stringify({ receiverId, type }),
  });

export const getCallHistory = () => request('/calls/history');
