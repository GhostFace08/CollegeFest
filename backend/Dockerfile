# ── Stage 1: Install production dependencies ─────────────
FROM node:18-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Production image ─────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package*.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/app.js"]