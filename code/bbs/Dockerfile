FROM node:20

WORKDIR /app

# Copy the bbs files
COPY bbs/package*.json ./
RUN npm install

# Copy the source code and shared dependencies
COPY bbs/ ./bbs/
COPY shared/ ./shared/
COPY simulator/ ./simulator/

# Set the final working directory to the game-server code
WORKDIR /app/bbs

# Copy everything
COPY . .

# Install project dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Run with vite
CMD ["npm", "run", "dev"]
