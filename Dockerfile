# Use Node.js 20
FROM node:20-alpine

# Create and set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code (excluding files in .dockerignore)
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV TRUST_PROXY=1

# Expose the port the app runs on
EXPOSE 8080

# Create non-root user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "server.js"]
