// server/config/loadConfig.js
const fs = require('fs');
const path = require('path');

// Define the path to your config file
const configPath = path.join(__dirname, 'config.json');

// Check if the config file exists
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log('Configuration loaded successfully:', config);
} else {
  console.error('Configuration file not found!');
  process.exit(1); // Exit the process if config file is missing
}
