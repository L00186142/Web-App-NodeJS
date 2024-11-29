const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const googleRoutes = require('./routes/google');
const notificationsRoutes = require('./routes/notifications');

const app = express();

const corsOptions = {
  origin: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  optionsSuccessStatus: 200,
};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use('/auth', authRoutes);
app.use('/google', googleRoutes);
app.use('/notifications', notificationsRoutes);

// Privacy Policy and Terms of Service
app.get('/privacy-policy', (req, res) => {
  res.send('<h1>Privacy Policy</h1><p>Your app privacy policy goes here.</p>');
});

app.get('/terms', (req, res) => {
  res.send('<h1>Terms of Service</h1><p>Your app Terms of Service go here.</p>');
});

// Home Page
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.send(`
    <h1>Welcome to the Google Drive App</h1>
    <p><a href="${baseUrl}/auth/google/login">Login with Google</a></p>
    <p><a href="${baseUrl}/google/files">View Google Drive Files</a></p>
    <p><a href="${baseUrl}/google/change-log">View Change Log</a></p>
    <p><a href="${baseUrl}/google/recent-activity">View Recent Activity</a></p>
    <p><a href="${baseUrl}/privacy-policy">Privacy Policy</a></p>
    <p><a href="${baseUrl}/terms">Terms of Service</a></p>
  `);
});

// 404 Middleware
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).send('<h1>Something went wrong on the server</h1>');
});

module.exports = app;
