const fs = require('fs');
const path = require('path');

const adminSessionsFilePath = path.join(__dirname, '../data/admin-sessions.json');

// Function to load admin sessions data
function loadAdminSessions() {
  const data = fs.readFileSync(adminSessionsFilePath, 'utf-8');
  return JSON.parse(data).sessions;
}

// Function to add a new admin session
function addAdminSession(session) {
  const sessions = loadAdminSessions();
  sessions.push(session);
  fs.writeFileSync(adminSessionsFilePath, JSON.stringify({ sessions }, null, 2));
}

// Function to find an admin session by ID
function findAdminSessionById(sessionId) {
  const sessions = loadAdminSessions();
  return sessions.find(session => session.id === sessionId);
}

module.exports = {
  loadAdminSessions,
  addAdminSession,
  findAdminSessionById
};
