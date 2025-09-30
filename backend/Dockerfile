# Use Node.js 20 for better Firebase compatibility
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Set build arguments for secrets
ARG JWT_SECRET
ARG FIREBASE_DATABASE_SECRET

# Create .env file with build arguments
RUN echo "JWT_SECRET=$JWT_SECRET" > .env && \
    echo "FIREBASE_DATABASE_SECRET=$FIREBASE_DATABASE_SECRET" >> .env

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup --gid 1001 --system nodejs && \
    adduser --uid 1001 --system nextjs && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Health check with timeout and retry
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application with node directly instead of npm for better signal handling
CMD ["node", "server.js"]
