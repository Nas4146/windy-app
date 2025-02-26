# Stage 1: Build the SvelteKit app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy app files
COPY . .

# Copy production environment file
#COPY .env.production .env


# Build the app
RUN npm run build

# Debug - check what files were generated
RUN ls -la .svelte-kit/output/

# Stage 2: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built files - simplified to avoid missing directories
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/node_modules ./node_modules

# Install production dependencies
#RUN npm ci --omit=dev

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the server
CMD ["node", "build"]