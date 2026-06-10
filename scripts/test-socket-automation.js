const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:4001';
const ROOM = 'automation-test-room';

function connectClient(userId) {
  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, { query: { userId } });
    socket.on('connect', () => {
      console.log(`${userId} connected (${socket.id})`);
      socket.emit('join', ROOM);
      resolve(socket);
    });
    socket.on('connect_error', (err) => {
      console.error(`${userId} connect_error`, err.message);
      process.exit(1);
    });
  });
}

async function run() {
  console.log('Starting Socket.IO automation test...');
  const alice = await connectClient('automation-alice');
  const bob = await connectClient('automation-bob');

  bob.on('message', (payload) => {
    console.log('Bob received:', payload);
    if (payload.content === 'Hello from Alice') {
      console.log('✅ Automation test passed.');
      alice.disconnect();
      bob.disconnect();
      process.exit(0);
    }
  });

  setTimeout(() => {
    console.log('Alice sending message...');
    alice.emit('message', { conversationId: ROOM, message: { id: 'msg1', senderId: 'automation-alice', senderName: 'Alice', content: 'Hello from Alice', time: new Date().toISOString() } });
  }, 1000);

  setTimeout(() => {
    console.error('❌ Automation test failed: no message received within timeout.');
    alice.disconnect();
    bob.disconnect();
    process.exit(1);
  }, 5000);
}

run().catch((err) => {
  console.error('Automation script error:', err);
  process.exit(1);
});
