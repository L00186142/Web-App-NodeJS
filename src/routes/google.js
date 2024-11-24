const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { loadToken } = require('../utils/tokenManager');

const router = express.Router();

let io; // To store the Socket.IO instance

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/auth/google/callback`
);

const logFilePath = path.join(__dirname, '../../logs/file-change-log.txt');

// Ensure the log file exists
function ensureLogFileExists() {
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.writeFileSync(logFilePath, '', 'utf8');
  }
}

// Append messages to the log file for Moved and Deleted actions
function appendToLogForChangeLog(io, timestamp, actor, action, target) {
  if (action !== 'Deleted' && action !== 'Moved') return;

  const formattedMessage = `[${new Date(timestamp).toLocaleString()}] 
    User: ${actor}
    Action: ${action}
    Target: ${target}\n`;

  ensureLogFileExists();
  fs.appendFileSync(logFilePath, formattedMessage, 'utf8');

  // Emit to clients for real-time updates
  if (io) {
    io.emit('fileChange', formattedMessage);
  }
}

// Middleware to validate tokens
async function checkTokenMiddleware(req, res, next) {
  try {
    const token = req.cookies.google_auth_token;
    if (token) {
      const parsedToken = JSON.parse(token);
      oauth2Client.setCredentials(parsedToken);

      // Test the token with a small API call
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      await drive.files.list({ pageSize: 1 });
      return next();
    }
    console.error('No valid tokens found. Redirecting to login.');
    return res.redirect('/auth/google/login');
  } catch (error) {
    console.error('Token validation failed:', error.message);
    return res.redirect('/auth/google/login');
  }
}

// Function to map activity types
function getActionType(activity) {
  if (activity.primaryActionDetail?.create) return 'Created';
  if (activity.primaryActionDetail?.edit) return 'Edited';
  if (activity.primaryActionDetail?.move) return 'Moved';
  if (activity.primaryActionDetail?.delete) return 'Deleted';
  return 'Performed an action';
}

// Function to get the actor's name
function getActorName(actor) {
  if (actor?.user?.knownUser?.displayName) {
    return actor.user.knownUser.displayName; // Human-readable display name
  }
  if (actor?.user?.knownUser?.personName) {
    return actor.user.knownUser.personName; // Internal person ID (fallback)
  }
  if (actor?.administrator) {
    return 'Administrator'; // Handle admin actions
  }
  return 'Unknown User'; // Final fallback if nothing is available
}

// Fetch Google Drive files
router.get('/files', checkTokenMiddleware, async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    async function fetchHierarchy(parentId = 'root', parentPath = '') {
      const response = await drive.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size)',
      });

      const items = response.data.files || [];
      const folders = items.filter((item) => item.mimeType === 'application/vnd.google-apps.folder');
      const files = items.filter((item) => item.mimeType !== 'application/vnd.google-apps.folder');

      const folderContents = await Promise.all(
        folders.map(async (folder) => ({
          name: folder.name,
          type: 'folder',
          path: `${parentPath}/${folder.name}`,
          children: await fetchHierarchy(folder.id, `${parentPath}/${folder.name}`),
        }))
      );

      const fileContents = files.map((file) => ({
        name: file.name,
        type: 'file',
        path: `${parentPath}/${file.name}`,
        size: file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown Size',
      }));

      return [...folderContents, ...fileContents];
    }

    const hierarchy = await fetchHierarchy();

    function renderHierarchy(items) {
      return `
        <ul>
          ${items
            .map(
              (item) =>
                `<li>
                  ${item.type === 'folder' ? '📁' : '📄'} ${item.name}
                  ${item.type === 'folder' ? renderHierarchy(item.children) : ''}
                </li>`
            )
            .join('')}
        </ul>
      `;
    }

    res.send(`
      <h1>Your Google Drive Files</h1>
      ${renderHierarchy(hierarchy)}
      <a href="/">Home</a>
    `);
  } catch (error) {
    console.error('Error fetching Google Drive files:', error.message);
    res.status(500).send('Failed to fetch files.');
  }
});

// Recent Activity: Logs all actions
router.get('/recent-activity', async (req, res) => {
  try {
    const service = google.driveactivity({ version: 'v2', auth: oauth2Client });
    const response = await service.activity.query({ requestBody: { pageSize: 10 } });
    const activities = response.data.activities;

    if (!activities || activities.length === 0) {
      return res.send('<h1>No recent activity</h1><a href="/">Home</a>');
    }

    const formattedActivities = activities.map((activity) => {
      const timestamp = activity.timestamp || 'Unknown time';
      const actor = getActorName(activity.actors[0]);
      const action = getActionType(activity);
      const target = activity.targets?.[0]?.driveItem?.title || 'Unnamed Item';

      // Log Deleted and Moved actions to change-log
      appendToLogForChangeLog(io, timestamp, actor, action, target);

      return `<li><b>${new Date(timestamp).toLocaleString()}</b>: 
                <b>${actor}</b> <i>${action}</i> <b>${target}</b></li>`;
    });

    res.send(`
      <h1>Recent Google Drive Activity</h1>
      <ul>${formattedActivities.join('')}</ul>
      <a href="/">Home</a>
    `);
  } catch (error) {
    console.error('Error fetching recent activity:', error.message);
    res.status(500).send('Failed to fetch recent activity.');
  }
});

// Change Log: Display only Deleted and Moved actions in real time
router.get('/change-log', (req, res) => {
  try {
    ensureLogFileExists();
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    res.send(`
      <h1>Change Log</h1>
      <pre id="log">${logContent}</pre>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();

        // Listen for real-time updates
        socket.on('fileChange', (message) => {
          const logElement = document.getElementById('log');
          logElement.textContent += '\\n' + message;
        });
      </script>
      <a href="/">Home</a>
    `);
  } catch (error) {
    console.error('Error reading change log:', error.message);
    res.status(500).send('Failed to read change log.');
  }
});

// Initialize Socket.IO
router.initSocket = function (socketIo) {
  io = socketIo;
};

module.exports = router;
