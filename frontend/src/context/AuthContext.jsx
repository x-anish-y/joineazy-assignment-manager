import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth.js';
import * as groupApi from '../api/groups.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshGroup = useCallback(async () => {
    if (!token) {
      setGroup(null);
      return;
    }
    try {
      const res = await groupApi.getMyGroup();
      if (res.success && res.data?.group) {
        setGroup(res.data.group);
      } else {
        setGroup(null);
      }
    } catch {
      setGroup(null);
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setGroup(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user.role === 'student') {
          await refreshGroup();
        }
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, refreshGroup]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginUser = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.role === 'student') {
      refreshGroup();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setGroup(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    token,
    group,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    loginUser,
    logout,
    refreshGroup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
