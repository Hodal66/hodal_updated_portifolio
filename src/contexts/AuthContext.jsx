import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, verifyOtp as verifyOtpApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);

    // If account requires verification, store email and throw for caller to handle
    if (data.requiresVerification) {
      setPendingEmail(data.email);
      const error = new Error(data.message);
      error.requiresVerification = true;
      error.email = data.email;
      throw error;
    }

    const { user: userData, tokens } = data;
    localStorage.setItem('token', tokens.access.token);
    localStorage.setItem('refreshToken', tokens.refresh.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(tokens.access.token);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    const data = await registerUser(name, email, password, confirmPassword);
    // Returns { message, email } — user must verify OTP
    setPendingEmail(data.email);
    return data;
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const data = await verifyOtpApi(email, otp);
    const { user: userData, tokens } = data;
    localStorage.setItem('token', tokens.access.token);
    localStorage.setItem('refreshToken', tokens.refresh.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(tokens.access.token);
    setPendingEmail(null);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Even if API call fails, clear local state
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setPendingEmail(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = user?.roles?.includes('admin') ?? false;
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      pendingEmail,
      setPendingEmail,
      login,
      register,
      verifyOtp,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
