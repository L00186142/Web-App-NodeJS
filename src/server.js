const http = require('http');
const app = require('./app');
require('dotenv').config();

// Use the Heroku-provided PORT or default to 3000
const PORT = process.env.PORT || 3000;

// Create and start the server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Display the BASE_URL for debugging
  if (process.env.BASE_URL) {
    console.log(`BASE_URL is set to: ${process.env.BASE_URL}`);
  } else {
    console.warn('BASE_URL is not set. Ensure it is configured in your environment variables.');
  }
});
