# STAGE 1: Build the React App
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# This creates the /dist folder with your HTML/CSS/JS
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:alpine
# Copy the built files from Stage 1 to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Add custom Nginx config for React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
