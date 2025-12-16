# server/Dockerfile
FROM node:18-slim

# 1. Install System Tools (Python + Nmap CLI)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nmap \
    && rm -rf /var/lib/apt/lists/*

# 2. Install the Python Wrapper Library (THE MISSING PIECE)
RUN pip3 install python-nmap --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files from server folder
COPY server/package*.json ./

# Install Node dependencies
RUN npm install

# Copy EVERYTHING from root
COPY . .

# Default command
CMD ["node", "server/server.js"]
