# Node.js version — .node-version と同期すること
ARG NODE_MAJOR=22

# Build stage
FROM node:${NODE_MAJOR}-alpine AS builder

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile first for better caching
COPY pnpm-lock.yaml ./

# Fetch dependencies (cached layer)
RUN pnpm fetch

# Copy package files
COPY package.json ./

# Install all dependencies from cache
RUN pnpm install --frozen-lockfile --offline

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Prune dev dependencies
RUN pnpm install --frozen-lockfile --offline --prod


# Runtime stage
FROM node:${NODE_MAJOR}-alpine AS runtime

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy production dependencies and package.json from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4321

# Set environment to production
ENV HOST=0.0.0.0
ENV PORT=4321

# Start the application
CMD ["node", "./dist/server/entry.mjs"]
