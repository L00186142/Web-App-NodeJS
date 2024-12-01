const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();

// **Determine if Running Locally or in Production**
const isLocal = process.env.NODE_ENV !== 'production';

// **OAuth 2.0 Client Setup**
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  isLocal
    ? `http://localhost:${process.env.PORT || 3000}/auth/google/callback`
    : `${process.env.BASE_URL}/auth/google/callback`
);

// **Scopes for OAuth**
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.activity.readonly'
];

let userCredential = null;

// **Route: Login with Google**
router.get('/google/login', (req, res) => {
  // Generate OAuth 2.0 URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Ensures refresh token generation
    scope: SCOPES,
    prompt: 'consent', // Always re-prompt for consent
  });

  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

// **Route: OAuth 2.0 Callback**
router.get('/google/callback', async (req, res) => {
  console.log('Callback reached');
  console.log('Query Params:', req.query);

  const code = req.query.code;
  if (!code) {
    console.error('Missing authorization code.');
    return res.status(400).send('Missing authorization code.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens:', tokens);

    oauth2Client.setCredentials(tokens);
    res.cookie('google_auth_token', JSON.stringify(tokens), { httpOnly: true });
    res.redirect('/google/files');
  } catch (error) {
    console.error('Error during callback:', error.message);
    res.status(500).send('Authentication failed.');
  }
});

// **Optional Route: Logout and Clear Session**
router.get('/google/logout', (req, res) => {
  // Clear cookies
  res.clearCookie('google_auth_token');
  userCredential = null;
  console.log('User logged out and tokens cleared.');
  res.redirect('/');
});

module.exports = router;
