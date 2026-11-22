FROM node:20-alpine

# Install build essentials for native packages (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package manifests first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY . .

# Set non-root user permissions
RUN chown -R node:node /app
USER node

# Expose backend port
EXPOSE 5000

# Healthcheck hitting /api/health
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
