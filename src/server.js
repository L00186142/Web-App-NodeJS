const http = require('http');
const ngrok = require('@ngrok/ngrok');
const socketIo = require('socket.io');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIo(server); // Attach Socket.IO to the server

// Broadcast file change events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible globally for notifications
app.set('socketio', io);

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (process.env.USE_NGROK === 'true') {
    try {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTHTOKEN,
      });
      console.log(`ngrok tunnel established at: ${url}`);
      process.env.BASE_URL = url;
    } catch (error) {
      console.error('Failed to establish ngrok tunnel:', error.message);
    }
  } else {
    process.env.BASE_URL = `http://localhost:${PORT}`;
  }

  console.log(`BASE_URL dynamically set to: ${process.env.BASE_URL}`);
});
