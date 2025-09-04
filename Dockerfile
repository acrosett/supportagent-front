# Multi-stage build for Nuxt.js application
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate a standalone nuxt build
RUN npm run build

# Production image, copy all the files and run nuxt
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NUXT_TELEMETRY_DISABLED 1

# Set default values that can be overridden
ENV NUXT_PORT=3000
ENV NUXT_HOST=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copy the standalone output
COPY --from=builder /app/.output ./

# Create a startup script that maps NUXT_PORT to PORT that Nuxt expects
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'export PORT=${NUXT_PORT:-3000}' >> /app/start.sh && \
    echo 'export HOST=${NUXT_HOST:-0.0.0.0}' >> /app/start.sh && \
    echo 'exec node server/index.mjs' >> /app/start.sh && \
    chmod +x /app/start.sh

USER nuxtjs

CMD ["/app/start.sh"]
