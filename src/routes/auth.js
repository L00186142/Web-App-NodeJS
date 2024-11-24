const express = require('express');
const { google } = require('googleapis');
const { loadToken } = require('../utils/tokenManager');

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/auth/google/callback`
);

// Google OAuth Login
router.get('/google/login', async (req, res) => {
  try {
    // Check if the token exists and is valid
    const token = req.cookies.google_auth_token;

    if (token) {
      const parsedToken = JSON.parse(token);
      oauth2Client.setCredentials(parsedToken);

      // Check if the access token is still valid
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      await drive.files.list({ pageSize: 1 });

      // If valid, redirect to the files page
      return res.redirect('/google/files');
    }

    // If no token, initiate the login flow
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.activity.readonly'],
      prompt: 'consent', // Ensure fresh consent if needed
    });
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error during login check:', error.message);

    // If token is invalid, initiate login flow
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.activity.readonly'],
      prompt: 'consent',
    });
    res.redirect(authUrl);
  }
});

// Google OAuth Callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Missing authorization code.');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens in cookies
    res.cookie('google_auth_token', JSON.stringify(tokens), { httpOnly: true });

    console.log('Tokens saved:', tokens);

    res.redirect('/google/files');
  } catch (error) {
    console.error('Error during Google OAuth callback:', error.message);
    res.status(500).send('Google Authentication Failed.');
  }
});

module.exports = router;
