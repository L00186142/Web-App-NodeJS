require('dotenv').config();

module.exports = {
  google: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  },
  onedrive: {
    clientId: process.env.ONEDRIVE_CLIENT_ID,
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
    redirectUri: process.env.ONEDRIVE_REDIRECT_URI,
  },
  server: {
    baseUrl: process.env.BASE_URL,
  },
};
