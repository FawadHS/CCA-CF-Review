const fs = require('fs');
const path = require('path');

const sessionsFilePath = path.join(__dirname, '../data/sessions.json');

// Function to load sessions data
function loadSessions() {
  const data = fs.readFileSync(sessionsFilePath, 'utf-8');
  return JSON.parse(data).sessions;
}

// Function to add a new session
function addSession(session) {
  const sessions = loadSessions();
  sessions.push(session);
  fs.writeFileSync(sessionsFilePath, JSON.stringify({ sessions }, null, 2));
}

// Function to find a session by ID
function findSessionById(sessionId) {
  const sessions = loadSessions();
  return sessions.find(session => session.id === sessionId);
}

module.exports = {
  loadSessions,
  addSession,
  findSessionById
};
