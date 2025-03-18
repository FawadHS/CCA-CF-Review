const app = require('./app');
const http = require('http');
const os = require('os');

// Force port 8080 for Azure Web Apps
const PORT = 8080;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log('==================================================');
  console.log(`CCA-CF Survey Application started on port ${PORT}`);
  console.log('==================================================');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log(`Running on Node.js version: ${process.version}`);
  console.log(`Platform: ${os.platform()} ${os.release()}`);
  console.log(`Host: ${os.hostname()}`);
  console.log('==================================================');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Choose a different port.`);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  
  // Gracefully shutdown the server
  server.close(() => {
    process.exit(1);
  });
  
  // If server doesn't close in 5 seconds, force exit
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});