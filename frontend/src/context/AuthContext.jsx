import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      // Response format: accessToken, refreshToken, role, fullName
      const { accessToken, refreshToken, role, fullName } = data;

      const userInfo = { fullName, email: credentials.email, role };

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setToken(accessToken);
      setUserRole(role);
      setUser(userInfo);

      return { success: true, role };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid credentials',
      };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    setToken(null);
    setUserRole(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role: userRole,
        user,
        isAuthenticated: !!token,
        loading,
        login: loginUser,
        logout: logoutUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
