# server/Dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y python3 nmap && rm -rf /var/lib/apt/lists/*

# Set the root as working directory
WORKDIR /app

# Copy package files (from root)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy EVERYTHING from root into /app
COPY . .

# Default command (matches the path we expect)
CMD ["node", "server/server.js"]
