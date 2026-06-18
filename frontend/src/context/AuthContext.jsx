import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    const savedUser = localStorage.getItem('lms_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(username, email, password) {
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
