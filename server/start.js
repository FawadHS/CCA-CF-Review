import app from './app.js';
import http from 'http';
import os from 'os';
import dotenv from 'dotenv';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  logger.error('Failed to create logs directory:', err);
}

// Robust port configuration
const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Enhanced environment variable validation
const validateEnvVariables = () => {
  const requiredVars = ['NODE_ENV', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.warn(`Missing environment variables: ${missingVars.join(', ')}`);
  }

  // Set default values
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

  // Generate a secure fallback secret if not provided
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
    logger.warn('Generated a temporary JWT secret. Recommend setting a permanent secret.');
  }
};

// Validate and set environment variables
validateEnvVariables();

// Create HTTP server with improved error handling
const server = http.createServer({
  IncomingMessage: http.IncomingMessage,
  ServerResponse: http.ServerResponse
}, app);

// Configure server timeouts
server.setTimeout(30000); // 30 seconds
server.keepAliveTimeout = 61000; // 61 seconds
server.headersTimeout = 65000; // 65 seconds

// Retry configuration for server startup
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

const startServer = () => {
  let retryCount = 0;

  const attemptStart = () => {
    server.listen(PORT, HOST, () => {
      logger.info('==================================================');
      logger.info(`Application: CCA-CF Survey`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Listening on: ${HOST}:${PORT}`);
      logger.info('==================================================');
      logger.info(`Node.js: ${process.version}`);
      logger.info(`Platform: ${os.platform()} ${os.release()}`);
      logger.info(`Hostname: ${os.hostname()}`);
      logger.info('==================================================');
      logger.info('Available Routes:');
      logger.info('- /: Root page');
      logger.info('- /health: Health check endpoint');
      logger.info('- /api/auth/*: Authentication routes');
      logger.info('- /api/survey/*: Survey routes');
      logger.info('- /api/admin/*: Admin routes');
      logger.info('==================================================');
    });
  };

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        logger.warn(`Port ${PORT} in use. Retry attempt ${retryCount}`);
        setTimeout(attemptStart, RETRY_DELAY);
      } else {
        logger.error(`Failed to start server after ${MAX_RETRIES} attempts`);
        process.exit(1);
      }
    } else {
      logger.error('Unhandled server error:', error);
      process.exit(1);
    }
  });

  attemptStart();
};

// Graceful shutdown mechanism
const shutdown = (signal) => {
  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    // Additional cleanup can be added here
    logger.info('Server successfully shut down');
    process.exit(0);
  });

  // Force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Signal handlers for graceful shutdown
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => shutdown(signal));
});

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('UncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  shutdown('UnhandledRejection');
});

// Start the server
startServer();