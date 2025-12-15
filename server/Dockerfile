# Use a lightweight Node.js base
FROM node:20-slim

# Security: Don't run as root
# We install updates and necessary tools (Python + Nmap)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    nmap \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Setup Python Engine
# Create a virtual environment inside the container
ENV VIRTUAL_ENV=/app/engine/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python dependencies
COPY ../engine/requirements.txt ./engine/
RUN pip install --no-cache-dir -r ./engine/requirements.txt

# 2. Setup Node Server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# 3. Copy Source Code
COPY engine/ ../engine/
COPY server/ .

# Expose the API port
EXPOSE 5000

# Run as non-root user (Security Best Practice)
RUN chown -R node:node /app
USER node

CMD ["node", "server.js"]
