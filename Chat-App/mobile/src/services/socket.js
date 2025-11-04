import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
      if (userId) {
        this.socket.emit('join', { userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinChat(chatId, userId) {
    if (this.socket) {
      this.socket.emit('join', { chatId, userId });
    }
  }

  leaveChat(chatId, userId) {
    if (this.socket) {
      this.socket.emit('leave', { chatId, userId });
    }
  }

  sendTyping(chatId, userId, typing) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, userId, typing });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
