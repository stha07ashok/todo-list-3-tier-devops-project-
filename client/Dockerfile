# Stage 1: Build the app
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Ensure your next.config.js has output: 'standalone'
RUN npm run build

# Stage 2: Run the app
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Copy only the necessary files from the builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]