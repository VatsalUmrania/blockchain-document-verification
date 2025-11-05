# syntax=docker/dockerfile:1

ARG NODE_VERSION=18

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Install serve globally for serving static files
RUN npm install -g serve

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing production dependencies.
FROM base as deps

# Copy package files
COPY package.json ./

# Download dependencies - use npm install instead of npm ci when no lock file
RUN npm install --omit=dev

################################################################################
# Create a stage for building the application.
FROM deps as build

# Copy package files
COPY package.json ./

# Download all dependencies
RUN npm install

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json ./

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 5173

# Run the application.
CMD ["serve", "-s", "dist", "-l", "5173"]