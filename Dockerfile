FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy all project files
COPY . .

# Set working directory to server
WORKDIR /app/server

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["node", "start.js"]