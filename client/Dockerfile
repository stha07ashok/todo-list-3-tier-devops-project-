# STAGE 1: Base
FROM ubuntu:24.04 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# STAGE 2: Deps
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# STAGE 3: Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs ./
COPY app ./app
COPY public ./public
RUN npm run build

# STAGE 4: Final Production Runner 
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]