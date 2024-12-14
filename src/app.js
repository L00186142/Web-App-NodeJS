const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
app.use('/src', express.static(path.join(__dirname, 'src')));


const authRoutes = require('./routes/auth');
const googleRoutes = require('./routes/google');

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
    <p><a href="${baseUrl}/google/recent-activity">View Recent Activity</a></p>
    <p><a href="${baseUrl}/privacy-policy">Privacy Policy</a></p>
    <p><a href="${baseUrl}/terms">Terms of Service</a></p>
    <script type="module" src="/src/firebase.js"></script> <!-- Include Firebase JS -->
  `);
});

app.get('/', (req, res) => {
  const firebaseConfig = {
    apiKey: "AIzaSyCGVBt-1cj3kEz9EjfbbSMKLAlZUkE6txw",
    authDomain: "web-hosting-cloud-a8a14.firebaseapp.com",
    projectId: "web-hosting-cloud-a8a14",
    storageBucket: "web-hosting-cloud-a8a14.firebasestorage.app",
    messagingSenderId: "875833291292",
    appId: "1:875833291292:web:ee734267fdaa195c68a5d9",
    measurementId: "G-BV238RR5W8"
  };

  res.send(`
    <h1>Welcome to the Google Drive App</h1>
    <script>
      const firebaseConfig = ${JSON.stringify(firebaseConfig)};
      import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
      const app = initializeApp(firebaseConfig);
    </script>
    <p><a href="/auth/google/login">Login with Google</a></p>
    <p><a href="/google/files">View Google Drive Files</a></p>
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

