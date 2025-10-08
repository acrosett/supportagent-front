# syntax=docker/dockerfile:1.6
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NUXT_PUBLIC_API_BASE_URL
ARG NUXT_PUBLIC_SOCKET_BASE_URL
ARG APP_VERSION
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL
ENV NUXT_PUBLIC_SOCKET_BASE_URL=$NUXT_PUBLIC_SOCKET_BASE_URL
ENV APP_VERSION=$APP_VERSION
ENV NODE_ENV=production
RUN npm run generate  # or: npx nuxi generate


FROM alpine:3.20
WORKDIR /artifact
# ⬇️ copy CONTENTS so /artifact has `index.html` directly
COPY --from=build /app/.output/public/ .
