# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install --production --ignore-scripts

# Copy source code
COPY . .

# Production stage
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Copy from builder
COPY --from=builder --chown=bun:bun /app ./

# Copy entrypoint script
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

USER bun

# Expose port
EXPOSE 5003

# Health check - use the health endpoint
HEALTHCHECK --interval=15s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5003/api/v1/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]