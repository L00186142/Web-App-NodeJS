const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO
 * @param {http.Server} server - The HTTP server instance
 */
function initializeSocketIO(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

/**
 * Get the initialized Socket.IO instance
 * @returns {Server} The Socket.IO instance
 */
function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO is not initialized. Call initializeSocketIO first.');
  }
  return io;
}

module.exports = {
  initializeSocketIO,
  getSocketIO,
};
