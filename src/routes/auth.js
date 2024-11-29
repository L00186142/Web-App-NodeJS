const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();

// OAuth 2.0 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/auth/google/callback`
);

// Scopes
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.activity.readonly',
];

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
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens in cookies for future use
    res.cookie('google_auth_token', JSON.stringify(tokens), { httpOnly: true });

    console.log('OAuth Tokens:', tokens);
    res.redirect('/google/files'); // Redirect to Google Drive files page
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.message);
    res.status(500).send('Authentication failed.');
  }
});

module.exports = router;
