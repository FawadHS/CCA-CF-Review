FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy the rest of the application
COPY . .

# Set working directory to server
WORKDIR /app/server

# Expose the port the app will run on
EXPOSE 8080

# Start the application
CMD ["node", "start.js"]