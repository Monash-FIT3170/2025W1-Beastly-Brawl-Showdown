FROM node:18-bullseye

WORKDIR /app

# Copy the game-server-v2 files
COPY game-server-v2/package*.json ./
RUN npm install

# Copy the source code and shared dependencies
COPY game-server-v2/ ./game-server-v2/
COPY shared/ ./shared/
COPY simulator/ ./simulator/

# Set the final working directory to the game-server code
WORKDIR /app/game-server-v2

# Install ts-node and typescript
RUN npm install -g ts-node typescript

# Copy everything
COPY . .

# Install project dependencies
RUN npm install

# Expose port
EXPOSE 8080

# Run with ts-node
CMD ["npm", "start"]