import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import crypto from 'crypto';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import surveyRoutes from './routes/survey.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config({ 
  path: path.resolve(__dirname, '.env') 
});

// Enhanced logging configuration
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create a logger instance with more robust configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'server.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Ensure critical directories exist
try {
  const logsDir = path.join(__dirname, 'logs');
  const dataDir = path.join(__dirname, 'data');
  
  [logsDir, dataDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (err) {
  logger.error('Failed to create necessary directories:', err);
}

// Create Express app
const app = express();

// Enhanced configuration and security
app.disable('x-powered-by');
app.set('trust proxy', true);

// Comprehensive CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Advanced rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different rate limits based on route
    if (req.url.startsWith('/api/admin')) return 50; // More restrictive for admin routes
    return 100; // Standard limit for other routes
  },
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true
});

// Security middleware configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' }
};

// Middleware application
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use('/api/', apiLimiter);
app.use(bodyParser.json({ 
  limit: '10kb',  // Prevent large payload attacks
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
  }
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Token verification middleware with enhanced security
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token required' 
      });
    }

    // More robust token verification logic would go here
    // This is a placeholder and should be replaced with proper JWT verification
    const sessionsFile = path.join(__dirname, 'data', 'sessions.json');
    const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8')).sessions;
    const session = sessions.find(s => s.token === token);

    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    req.user = { 
      country: session.country, 
      username: session.username 
    };
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

// Static file serving with security headers
app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/survey', verifyToken, surveyRoutes);
app.use('/api/admin', adminRoutes);

// Root and health check routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: process.env.npm_package_version,
    nodeVersion: process.version,
    uptime: process.uptime()
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  logger.error(`Error: ${err.message}`, { 
    status: statusCode, 
    path: req.path,
    method: req.method,
    stack: err.stack 
  });

  res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedUrl: req.url
  });
});

export default app;
