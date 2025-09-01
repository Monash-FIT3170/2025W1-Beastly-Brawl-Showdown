FROM node:18-bullseye
WORKDIR /app

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
