const fs = require('fs');
const path = require('path');

const tokenFilePath = path.join(__dirname, '../../tokens.json');

function ensureTokenFileExists() {
  if (!fs.existsSync(tokenFilePath)) {
    fs.writeFileSync(tokenFilePath, JSON.stringify({}), 'utf8');
  }
}

function saveToken(key, token) {
  ensureTokenFileExists();
  const tokens = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
  tokens[key] = token;
  fs.writeFileSync(tokenFilePath, JSON.stringify(tokens), 'utf8');
}

function loadToken(key) {
  ensureTokenFileExists();
  const tokens = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
  return tokens[key];
}

module.exports = {
  saveToken,
  loadToken,
};
