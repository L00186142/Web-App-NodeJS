const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/auth/google/callback`
);

// Google OAuth Login
router.get('/google/login', async (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
      prompt: 'consent',
    });
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).send('Failed to initiate Google login.');
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
