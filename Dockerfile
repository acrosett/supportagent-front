# syntax=docker/dockerfile:1.6
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Copy the build.env file created by the build script
COPY build.env ./

# Source all environment variables from build.env
RUN set -a && . ./build.env && set +a && env

# Set NODE_ENV for production build
ENV NODE_ENV=production

# Run the build with all environment variables loaded
RUN set -a && . ./build.env && npm run generate


FROM alpine:3.20
WORKDIR /artifact
# ⬇️ copy CONTENTS so /artifact has `index.html` directly
COPY --from=build /app/.output/public/ .
