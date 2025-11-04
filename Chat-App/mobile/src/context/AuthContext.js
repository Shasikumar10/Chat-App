import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const { data } = await getProfile();
        setUser(data.user);
        socketService.connect(data.user.id);
      }
    } catch (error) {
      console.error('Load user error:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    socketService.connect(data.user.id);
    return data;
  };

  const register = async (email, password, displayName) => {
    const { data } = await apiRegister({ email, password, displayName });
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    socketService.connect(data.user.id);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
