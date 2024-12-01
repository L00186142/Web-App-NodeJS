const http = require('http');
const app = require('./app'); // Import your Express app
require('dotenv').config();

const PORT = process.env.PORT || 3000; // Use Heroku's dynamic port or default to 3000

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`BASE_URL is set to: ${process.env.BASE_URL}`);
});
