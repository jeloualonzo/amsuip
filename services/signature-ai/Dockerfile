# Use Node.js LTS version
FROM node:18-alpine

# Install system dependencies for Sharp and ONNX Runtime
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create models directory
RUN mkdir -p /models

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S signature-ai -u 1001

# Change ownership of the app directory
RUN chown -R signature-ai:nodejs /app
RUN chown -R signature-ai:nodejs /models

# Switch to non-root user
USER signature-ai

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]