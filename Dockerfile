# syntax=docker/dockerfile:1

ARG NODE_VERSION=18

# Dockerfile for blockchain document verification smart contracts
FROM node:${NODE_VERSION}-alpine

# Install bash and curl for better script support
RUN apk add --no-cache bash curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY hardhat.config.js ./

# Install dependencies
RUN npm install

# Copy contracts and scripts
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/

# Copy artifacts if they exist
# COPY artifacts/ ./artifacts/ 2>/dev/null || echo "No artifacts to copy"
COPY artifacts/ ./artifacts/

# Expose default hardhat network port
EXPOSE 8545

# Default command - can be overridden by docker-compose
CMD ["npm", "run", "node"]