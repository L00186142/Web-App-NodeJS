const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const logFilePath = path.join(__dirname, '../../logs/file-change-log.txt');

// Ensure the log file exists
function ensureLogFileExists() {
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.writeFileSync(logFilePath, '', 'utf8');
  }
}

function appendToLog(message) {
  ensureLogFileExists();
  fs.appendFileSync(logFilePath, message + '\n', 'utf8');
}

router.post('/google', (req, res) => {
  console.log('Webhook received:', req.body);
  appendToLog(`[${new Date().toISOString()}] Notification: ${JSON.stringify(req.body)}`);
  res.status(200).send('Notification received.');
});

module.exports = router;
