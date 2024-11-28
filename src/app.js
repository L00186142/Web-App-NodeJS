const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const googleRoutes = require('./routes/google');
const notificationsRoutes = require('./routes/notifications');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/google', googleRoutes);
app.use('/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.send(`
    <h1>Welcome to the Google Drive App</h1>
    <p><a href="${baseUrl}/auth/google/login">Login with Google</a></p>
    <p><a href="${baseUrl}/google/files">View Google Drive Files</a></p>
    <p><a href="${baseUrl}/google/change-log">View Change Log</a></p>
    <p><a href="${baseUrl}/google/recent-activity">View Recent Activity</a></p>
  `);
});

module.exports = app;
