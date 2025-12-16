# server/Dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y python3 nmap && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# 1. Copy package files FROM THE SERVER FOLDER
COPY server/package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy EVERYTHING from root
COPY . .

# Default command
CMD ["node", "server/server.js"]
