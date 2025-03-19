#!/bin/bash
# Azure Web App Deployment Script
# This file is executed during the deployment of the web app

# Exit immediately if any command fails
set -e

echo "🚀 Starting Azure Web App Deployment..."

# Navigate to the server directory
cd server

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Ensure data directory exists
echo "📂 Ensuring data directory exists..."
mkdir -p data

# Function to create a missing JSON file with default content
create_json_file() {
  local file_path=$1
  local default_content=$2

  if [ ! -f "$file_path" ]; then
    echo "$default_content" > "$file_path"
    echo "✅ Created default $file_path"
  else
    echo "ℹ️ $file_path already exists, skipping creation."
  fi
}

# Create default data files if they don't exist
create_json_file "data/countries.json" '{"countries":[{"id":"1","name":"Demo Country"}]}'
create_json_file "data/sessions.json" '{"sessions":[]}'
create_json_file "data/admin-sessions.json" '{"sessions":[]}'
create_json_file "data/surveys.json" '{"surveys":[]}'
create_json_file "data/users.json" '{"users":[]}'

# Ensure proper permissions on data directory
echo "🔑 Setting proper permissions on data directory..."
chmod -R 755 data

# Start the server (Handled by Azure, but included for local debugging)
echo "🚀 Starting server..."
npm start

echo "✅ Deployment script completed successfully."
