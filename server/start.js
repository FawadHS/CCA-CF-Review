const app = require('./app');
const http = require('http');
const os = require('os');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Create a logger instance for better debugging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Ensure PORT is set correctly
const PORT = process.env.PORT || 8080;

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV', 'PORT', 'JWT_SECRET', 'ALLOWED_ORIGINS'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Debugging: Log environment variables (Remove in Production)
logger.info(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Loaded ✅' : 'Missing ❌'}`);
logger.info(`ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS ? 'Loaded ✅' : 'Missing ❌'}`);

// Create HTTP server
const server = http.createServer(app);

// Start the server with retry logic
let retryCount = 0;
const MAX_RETRIES = 3;

const startServer = () => {
  server.listen(PORT, '0.0.0.0', () => {
    logger.info('==================================================');
    logger.info(`CCA-CF Survey Application started on port ${PORT}`);
    logger.info('==================================================');
    logger.info(`Environment: ${process.env.NODE_ENV || 'production'}`);
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
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

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