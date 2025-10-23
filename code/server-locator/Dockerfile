FROM node:18-bullseye

WORKDIR /app

# Copy the server-locator files
COPY server-locator/package*.json ./
RUN npm install

# Copy the source code and shared dependencies
COPY server-locator/ ./server-locator/
COPY shared/ ./shared/
COPY simulator/ ./simulator/

# Set the final working directory to the game-server code
WORKDIR /app/server-locator

# Install ts-node and typescript
RUN npm install -g ts-node typescript

# Copy everything
COPY . .

# Install project dependencies
RUN npm install

# Expose port
EXPOSE 8000

# Run with ts-node
CMD ["npm", "start"]
