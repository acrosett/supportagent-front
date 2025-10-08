# syntax=docker/dockerfile:1.6
FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# pass any needed NUXT_PUBLIC_* via --build-arg => ARG => ENV
ARG NUXT_PUBLIC_API_BASE_URL
ARG NUXT_PUBLIC_SOCKET_BASE_URL
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL
ENV NUXT_PUBLIC_SOCKET_BASE_URL=$NUXT_PUBLIC_SOCKET_BASE_URL
RUN npm run build

FROM alpine:3.20
WORKDIR /artifact
# Nuxt 3 static output (SPA) is typically .output/public
COPY --from=build /app/.output/public /artifact
# (no CMD; this image is just a versioned artifact container)
