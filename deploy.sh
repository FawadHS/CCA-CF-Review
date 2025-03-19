#!/bin/bash
# Azure Web App Deployment Script
# This file is executed during the deployment of the web app

# Exit on error
set -e

# Navigate to the server directory
cd server

# Install production dependencies
echo "Installing production dependencies..."
npm install --production

# Ensure data directory exists
mkdir -p data

# Create default data files if they don't exist
if [ ! -f "data/countries.json" ]; then
  echo '{"countries":[{"id":"1","name":"Demo Country","password":"demo123"}]}' > data/countries.json
  echo "Created default countries.json"
fi

if [ ! -f "data/sessions.json" ]; then
  echo '{"sessions":[]}' > data/sessions.json
  echo "Created default sessions.json"
fi

if [ ! -f "data/admin-sessions.json" ]; then
  echo '{"sessions":[]}' > data/admin-sessions.json
  echo "Created default admin-sessions.json"
fi

if [ ! -f "data/surveys.json" ]; then
  echo '{"surveys":[]}' > data/surveys.json
  echo "Created default surveys.json"
fi

if [ ! -f "data/users.json" ]; then
  echo '{"users":[]}' > data/users.json
  echo "Created default users.json"
fi

# Ensure proper permissions on data directory
chmod -R 755 data

# Start the server (This is actually handled by Azure, but included for completeness)
echo "Starting server..."
npm start