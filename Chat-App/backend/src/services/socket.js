const { Server } = require('socket.io');
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', socket => {
    console.log('socket connected', socket.id);

    socket.on('join', ({ chatId, userId }) => {
      if (chatId) {
        socket.join(chatId);
      }
      socket.data.userId = userId;
      io.emit('presence:update', { userId, online: true });
    });

    socket.on('leave', ({ chatId, userId }) => {
      if (chatId) socket.leave(chatId);
      io.emit('presence:update', { userId, online: false });
    });

    socket.on('typing', ({ chatId, userId, typing }) => {
      if (chatId) socket.to(chatId).emit('typing', { chatId, userId, typing });
    });

    socket.on('message', (msg) => {
      if (msg && msg.chat) io.to(msg.chat).emit('message:new', msg);
    });

    socket.on('read', ({ chatId, messageId, userId }) => {
      if (chatId) io.to(chatId).emit('message:read', { chatId, messageId, userId });
    });

    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId) io.emit('presence:update', { userId, online: false });
      console.log('socket disconnected', socket.id);
    });
  });

  return io;
}

function getIo() {
  return io;
}

module.exports = initSocket;
module.exports.getIo = getIo;
