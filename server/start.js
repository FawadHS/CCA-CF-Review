const app = require('./app');
const http = require('http');
const os = require('os');
const dotenv = require('dotenv');
const winston = require('winston');
const path = require('path');

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
    new winston.transports.File({ 
      filename: path.join(__dirname, 'server.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Ensure PORT is set correctly - Azure provides process.env.PORT
const PORT = process.env.PORT || 8080;

// Set default values for required environment variables if not present
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
  logger.warn('NODE_ENV not set, defaulting to production');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'default-jwt-secret-' + Date.now();
  logger.warn('JWT_SECRET not set, using generated secret (insecure for production)');
}

if (!process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS = '*';
  logger.warn('ALLOWED_ORIGINS not set, defaulting to allow all origins');
}

// Log environment information
logger.info(`Starting server with configuration:`);
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`PORT: ${PORT}`);
logger.info(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set (value hidden)' : 'Not set'}`);
logger.info(`ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS}`);

// Create HTTP server
const server = http.createServer(app);

// Start the server with retry logic
let retryCount = 0;
const MAX_RETRIES = 3;

const startServer = () => {
  server.listen(PORT, () => {
    logger.info('==================================================');
    logger.info(`CCA-CF Survey Application started on port ${PORT}`);
    logger.info('==================================================');
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Running on Node.js version: ${process.version}`);
    logger.info(`Platform: ${os.platform()} ${os.release()}`);
    logger.info(`Host: ${os.hostname()}`);
    logger.info('==================================================');
    logger.info('Available routes:');
    logger.info('- /: Root page');
    logger.info('- /health: Health check endpoint');
    logger.info('- /api/auth/*: Authentication routes');
    logger.info('- /api/survey/*: Survey routes');
    logger.info('- /api/admin/*: Admin routes');
    logger.info('==================================================');
  });
};

// Handle server errors and retry if necessary
server.on('error', (error) => {
  logger.error('Server error:', error);

  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Retrying...`);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(() => {
        logger.info(`Retrying to start the server... Attempt ${retryCount}`);
        startServer();
      }, 3000);
    } else {
      logger.error(`Max retries reached. Port ${PORT} is still in use. Exiting.`);
      process.exit(1);
    }
  } else {
    logger.error('Unhandled server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown handling
const shutdown = (signal) => {
  logger.warn(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully shutting down.');
    process.exit(1);
  }, 5000);
};

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  shutdown('UncaughtException');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', reason);
  shutdown('UnhandledRejection');
});

// Start the server
startServer();