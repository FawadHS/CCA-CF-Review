// server/routes/admin.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to the countries JSON file
const countriesFilePath = path.join(__dirname, '../data/countries.json');

// Function to load the countries data
function loadCountries() {
  const data = fs.readFileSync(countriesFilePath, 'utf-8');
  return JSON.parse(data).countries;
}

// Path to the admin sessions file
const adminSessionsFilePath = path.join(__dirname, '../data/admin-sessions.json');

// Function to load admin sessions data
function loadAdminSessions() {
  const data = fs.readFileSync(adminSessionsFilePath, 'utf-8');
  return JSON.parse(data).sessions;
}

// Function to save admin sessions data
function saveAdminSessions(sessions) {
  fs.writeFileSync(adminSessionsFilePath, JSON.stringify({ sessions }, null, 2));
}

// Admin login route
router.post('/login', (req, res) => {
  console.log('Admin login attempt:', req.body);
  const { username, password } = req.body;

  // Verify we have required data
  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  // Hardcoded credentials for admin login (to be replaced with real logic)
  if (username === 'admin' && password === 'admin123') {
    const token = 'admin-jwt-token-' + Date.now(); // This can be a dynamically generated JWT token
    const session = { username, token };

    // Save the session to admin-sessions.json
    const sessions = loadAdminSessions();
    sessions.push(session);
    saveAdminSessions(sessions);

    console.log('Admin login successful:', { username, token: token.substring(0, 10) + '...' });
    res.status(200).json({ success: true, token });
  } else {
    console.log('Admin login failed: invalid credentials');
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Route to add a new country
router.post('/countries', (req, res) => {
  console.log('Add country request:', req.body);
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, message: 'Name and password are required' });
  }

  const countries = loadCountries();

  // Check if country already exists
  if (countries.some(country => country.name === name)) {
    return res.status(400).json({ success: false, message: 'Country already exists' });
  }

  // Add the new country to the list
  const newCountry = {
    id: (countries.length + 1).toString(), // Simple incrementing ID for new countries
    name: name,
    password: password
  };

  countries.push(newCountry);

  // Save the updated countries list
  fs.writeFileSync(countriesFilePath, JSON.stringify({ countries }, null, 2));

  console.log('Country added successfully:', name);
  res.status(200).json({ success: true, message: 'Country added successfully' });
});

// Route to get all countries (for admin to view them)
router.get('/countries', (req, res) => {
  try {
    const countries = loadCountries();
    console.log('Getting countries, count:', countries.length);
    res.status(200).json({ success: true, countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch countries' });
  }
});

module.exports = router;