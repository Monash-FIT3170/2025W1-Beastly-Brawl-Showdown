# Build stage (Meteor app build)
FROM node:18-bullseye AS builder

# Create a non-root user for building the app
RUN useradd -ms /bin/bash meteoruser

# Set root user to install system packages
USER root

# Install Meteor and required dependencies
RUN apt-get update && apt-get install -y curl bash \
  && curl https://install.meteor.com/ | sh

# Switch to the non-root user for the rest of the build
USER meteoruser

# Set working directory and copy source code
WORKDIR /app
COPY --chown=meteoruser:meteoruser . .

# Install dependencies and build the app
RUN meteor npm install \
  && meteor build --directory /app/build

# Production stage
FROM node:18-bullseye AS runner

# Create a non-root user for running the app
RUN useradd -ms /bin/bash meteoruser

# Set user and working directory
USER meteoruser
WORKDIR /app

# Copy the built bundle from the builder stage
COPY --from=builder /app/build/bundle /app/bundle

# Install server dependencies for production
WORKDIR /app/bundle/programs/server
RUN npm install --production

# Set environment variables
ENV MONGO_URL=mongodb://mongo:27017/beastly
ENV ROOT_URL=http://localhost
ENV PORT=3000

# Expose the port and run the app (adjusted for Meteor's entry point)
EXPOSE 3000
CMD ["node", "/app/bundle/main.js"]
