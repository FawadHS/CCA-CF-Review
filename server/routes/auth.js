const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to the countries file
const countriesFilePath = path.join(__dirname, '../data/countries.json');

// Path to the sessions file
const sessionsFilePath = path.join(__dirname, '../data/sessions.json');

// Function to load countries data
function loadCountries() {
  const data = fs.readFileSync(countriesFilePath, 'utf-8');
  return JSON.parse(data).countries;
}

// Function to load sessions data
function loadSessions() {
  const data = fs.readFileSync(sessionsFilePath, 'utf-8');
  return JSON.parse(data).sessions;
}

// Function to save sessions data
function saveSessions(sessions) {
  fs.writeFileSync(sessionsFilePath, JSON.stringify({ sessions }, null, 2));
}

// Example login route (modified to check against countries.json)
router.post('/login', (req, res) => {
  const { username, country, password } = req.body;

  console.log('Login attempt:', { username, country, password });  // Debug log

  // Load the countries data
  const countries = loadCountries();
  const countryData = countries.find(c => c.name === country);

  // Debug: Check if country data is retrieved correctly
  console.log('Country Data:', countryData);  // Debug log

  // Validate country name and password
  if (countryData) {
    console.log(`Password entered: ${password}, Stored password: ${countryData.password}`);  // Debug log
    if (countryData.password === password) {
      const token = 'fake-jwt-token'; // In a real-world app, generate a JWT token

      // Optional: If username is not provided, use the country name as the username
      const user = username || country;

      // Create a new session and save it to sessions.json
      const sessions = loadSessions();
      sessions.push({ username: user, country, token });
      saveSessions(sessions);

      console.log('Login successful:', { username: user, country, token });  // Debug log

      return res.status(200).json({ success: true, token });
    } else {
      console.log('Password mismatch');  // Debug log
    }
  } else {
    console.log('Country not found');  // Debug log
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Example session validation route (validates if token exists in sessions)
router.post('/validate-session', (req, res) => {
  const { token } = req.body;

  // Validate the session (replace with actual token validation logic)
  const sessions = loadSessions();
  const session = sessions.find(session => session.token === token);

  if (session) {
    res.status(200).json({ success: true, userInfo: { username: session.username, country: session.country } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
