FROM node:18-bullseye

# Set the root workdir
WORKDIR /app

# Copy package files and install deps
COPY game-server-v2/package*.json ./game-server-v2/
WORKDIR /app/game-server-v2
RUN npm install

# Copy required code and dependencies
COPY game-server-v2/ /app/game-server-v2/
COPY shared/ /app/shared/
COPY simulator/ /app/simulator/

# Install global tools
RUN npm install -g ts-node typescript

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
