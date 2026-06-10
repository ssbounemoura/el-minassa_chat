const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SOCKET_PORT || 4001;
const ORIGIN = process.env.SOCKET_ORIGIN || '*';

const server = http.createServer();
const io = new Server(server, { cors: { origin: ORIGIN } });

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'query=', socket.handshake.query);

  socket.on('join', (room) => {
    socket.join(room);
    const userId = socket.handshake.query.userId;
    io.to(room).emit('presence', { userId, online: true });
  });

  socket.on('leave', (room) => {
    socket.leave(room);
    const userId = socket.handshake.query.userId;
    io.to(room).emit('presence', { userId, online: false });
  });

  socket.on('message', (payload) => {
    try {
      const { conversationId, message } = payload;
      if (!conversationId || !message) return;
      io.to(conversationId).emit('message', message);
    } catch (err) {
      console.error('socket message handler error', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
