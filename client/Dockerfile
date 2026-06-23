# =========================================================
# STAGE 1: The Base Setup
# =========================================================

FROM ubuntu:24.04 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*
# =========================================================
# STAGE 2: Install Dependencies
# =========================================================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci
# =========================================================
# STAGE 3: Build the Application
# =========================================================

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# =========================================================
# STAGE 4: The Final Production Runner
# =========================================================

FROM base AS runner
ENV NODE_ENV production
# Create a secure system user so we aren't running as root
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
EXPOSE 3000
