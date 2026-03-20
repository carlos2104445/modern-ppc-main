# Multi-stage Dockerfile for Modern PPC Application

# Stage 1: Base image with dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Stage 2: Dependencies installation
FROM base AS dependencies
WORKDIR /app

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev

# Stage 3: Build stage
FROM dependencies AS build
WORKDIR /app

# Copy source code
COPY server ./server
COPY client ./client
COPY shared ./shared
COPY config ./config

# Build the application
RUN npm run build

# Stage 4: Production dependencies
FROM base AS prod-dependencies
WORKDIR /app

# Install only production dependencies
RUN npm ci --omit=dev

# Stage 5: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    tini

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=prod-dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Copy necessary configuration files
COPY --chown=nodejs:nodejs package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Switch to non-root user
USER nodejs

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Stage 6: Development image
FROM dependencies AS development
WORKDIR /app

# Copy source code
COPY server ./server
COPY client ./client
COPY shared ./shared
COPY config ./config

# Expose ports for development
EXPOSE 5000
EXPOSE 5173

# Set environment
ENV NODE_ENV=development

# Start development server
CMD ["npm", "run", "dev"]
