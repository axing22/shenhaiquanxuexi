FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat && yarn global add pnpm

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM deps AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Set build-time environment variables if needed
ARG NEXT_PUBLIC_WEB_URL
ARG NEXT_PUBLIC_AI_HUB_API_URL
ARG NEXT_PUBLIC_COS_BUCKET
ARG NEXT_PUBLIC_COS_REGION

# Increase Node.js memory limit for build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install production dependencies
RUN apk add --no-cache curl

# Create necessary directories and set permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p .next uploads logs && \
    chown -R nextjs:nodejs .

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy package.json for reference
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port 3001
EXPOSE 3001

# Production environment
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]