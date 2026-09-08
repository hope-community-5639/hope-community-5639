# Multi-stage production build for Hope Community Support on Google Cloud Run
# Stage 1: Build Vite client and bundle Express server
FROM node:22-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime image
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Run container as non-root user for security compliance
USER node

# Copy package descriptors and install production dependencies
COPY --chown=node:node package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy compiled production bundle from builder
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.cjs"]
