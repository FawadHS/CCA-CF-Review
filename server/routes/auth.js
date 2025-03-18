const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Path to the countries file
const countriesFilePath = path.join(__dirname, '../data/countries.json');

// Path to the sessions file
const sessionsFilePath = path.join(__dirname, '../data/sessions.json');

// Secret key for JWT (should be loaded from environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

// Function to load countries data
function loadCountries() {
  try {
    const data = fs.readFileSync(countriesFilePath, 'utf-8');
    return JSON.parse(data).countries;
  } catch (error) {
    console.error('Error loading countries:', error);
    return [];
  }
}

// Function to load sessions data
function loadSessions() {
  try {
    const data = fs.readFileSync(sessionsFilePath, 'utf-8');
    return JSON.parse(data).sessions;
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

// Function to save sessions data
function saveSessions(sessions) {
  try {
    fs.writeFileSync(sessionsFilePath, JSON.stringify({ sessions }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving sessions:', error);
    return false;
  }
}

// Generate a JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      username: user.username, 
      country: user.country 
    }, 
    JWT_SECRET, 
    { 
      expiresIn: '24h' 
    }
  );
}

// Login route
router.post('/login', (req, res) => {
  const { username, country, password } = req.body;

  // Input validation
  if (!country || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Country and password are required' 
    });
  }

  // Load the countries data
  const countries = loadCountries();
  const countryData = countries.find(c => c.name === country);

  // Validate country and password
  if (!countryData) {
    return res.status(404).json({ 
      success: false, 
      message: 'Country not found' 
    });
  }

  // Password validation 
  if (countryData.password !== password) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  // Determine username (use provided username or first user's username or country name)
  const effectiveUsername = username || 
    (countryData.users && countryData.users.length > 0 ? countryData.users[0].username : country);

  // Generate JWT token
  const token = generateToken({ username: effectiveUsername, country });

  // Save session
  const sessions = loadSessions();
  const newSession = {
    username: effectiveUsername,
    country,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  // Clean up expired sessions
  const validSessions = sessions.filter(
    session => new Date(session.expiresAt) > new Date()
  );

  validSessions.push(newSession);
  
  // Save sessions
  if (!saveSessions(validSessions)) {
    return res.status(500).json({ 
      success: false, 
      message: 'Unable to save session' 
    });
  }

  res.status(200).json({ 
    success: true, 
    token,
    username: effectiveUsername,
    country 
  });
});

// Session validation route
router.post('/validate-session', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Load sessions and validate
    const sessions = loadSessions();
    const validSession = sessions.find(
      session => 
        session.token === token && 
        new Date(session.expiresAt) > new Date()
    );

    if (!validSession) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    // Return user info
    res.status(200).json({ 
      success: true, 
      userInfo: {
        username: decoded.username, 
        country: decoded.country 
      } 
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

module.exports = router;