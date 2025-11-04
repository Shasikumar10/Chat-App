import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's local IP address when testing on a physical device
// For Android Emulator, use: http://10.0.2.2:4000/api
// For iOS Simulator, use: http://localhost:4000/api
// For Physical Device, use: http://YOUR_LOCAL_IP:4000/api
const API_URL = 'http://192.168.1.9:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const requestPasswordReset = (data) => api.post('/auth/password-reset/request', data);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.patch('/profile', data);
export const registerPushToken = (token) => api.post('/profile/push-token', { token });

// Chats
export const getChats = () => api.get('/chats');
export const getChat = (id) => api.get(`/chats/${id}`);
export const createChat = (data) => api.post('/chats', data);

// Messages
export const getMessages = (chatId, params) => api.get(`/messages/chat/${chatId}`, { params });
export const sendMessage = (data) => api.post('/messages', data);
export const editMessage = (id, data) => api.patch(`/messages/${id}`, data);
export const deleteMessage = (id) => api.delete(`/messages/${id}`);
export const markRead = (id) => api.post(`/messages/${id}/read`);
export const addReaction = (id, emoji) => api.post(`/messages/${id}/reactions`, { emoji });

// Uploads
export const uploadFile = async (uri, type = 'image') => {
  const formData = new FormData();
  const filename = uri.split('/').pop();
  formData.append('file', {
    uri,
    name: filename,
    type: type.includes('image') ? 'image/jpeg' : type,
  });

  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_URL}/uploads/single`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};

export default api;
