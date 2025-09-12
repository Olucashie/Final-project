# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies separately for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy app source
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "server.js"]
