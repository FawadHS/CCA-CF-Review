const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Import routes
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/survey');
const adminRoutes = require('./routes/admin');

// Load environment variables
dotenv.config();

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Create Express app
const app = express();

// Enable trust proxy for Azure deployment
app.set('trust proxy', 1);

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disabled to allow inline scripts (should be enabled in production)
}));

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Ensure required files exist
const requiredFiles = ['countries.json', 'sessions.json', 'admin-sessions.json', 'surveys.json', 'users.json'];
requiredFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ data: [] }, null, 2));
    logger.info(`Created missing data file: ${file}`);
  }
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const sessionsFile = path.join(__dirname, 'data', 'sessions.json');
    if (!fs.existsSync(sessionsFile)) {
      fs.writeFileSync(sessionsFile, JSON.stringify({ sessions: [] }, null, 2));
      logger.warn('Created missing sessions.json file');
    }

    const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8')).sessions;
    const session = sessions.find(s => s.token === token);

    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = { country: session.country, username: session.username };
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
  }
};

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/survey', verifyToken, surveyRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Export the app
module.exports = app;
