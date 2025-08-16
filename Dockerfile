FROM node:20-alpine AS base

# Set working directory
WORKDIR /adonsapp

# Install dependencies for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ git

# Install pnpm globally
#RUN npm install -g npm

# Copy package.json and related files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
FROM base AS dependencies
RUN npm install --force

# Build stage
FROM dependencies AS build
COPY . .
RUN node ace build --ignore-ts-errors
#RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /adonsapp

# Copy built assets from the build stage
COPY --from=build /adonsapp/build .
COPY --from=build /adonsapp/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3333
ENV HOST=0.0.0.0

# Expose the port the app runs on
EXPOSE 3333

# Create volume for uploads and database
VOLUME ["/adonsapp/tmp", "/adonsapp/uploads"]

# Run the app
CMD ["node", "adonsapp/bin/server.js"]

