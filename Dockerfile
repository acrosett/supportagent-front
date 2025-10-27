# syntax=docker/dockerfile:1.6
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev 
COPY . .

# Copy the build.env file created by the build script
COPY build.env ./

# Source all environment variables from build.env
RUN set -a && . ./build.env && set +a && env

# Set NODE_ENV for production build
ENV NODE_ENV=production

# Clear any existing cache and run the build
RUN rm -rf node_modules/.vite && \
    rm -rf node_modules/.cache && \
    rm -rf .vite && \
    rm -rf .nuxt && \
    rm -rf .output && \
    set -a && . ./build.env && npm run generate


FROM alpine:3.20
WORKDIR /artifact
# ⬇️ copy CONTENTS so /artifact has `index.html` directly
COPY --from=build /app/.output/public/ .
