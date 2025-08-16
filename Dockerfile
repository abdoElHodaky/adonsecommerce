FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ git

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and related files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS build
COPY . .
RUN node ace build --production
RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/build .
COPY --from=build /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

# Expose the port the app runs on
EXPOSE 3333

# Create volume for uploads and database
VOLUME ["/app/tmp", "/app/uploads"]

# Run the app
CMD ["node", "server.js"]

