FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY game-server-v2/package*.json ./
RUN npm install

# Copy app code & shared folder
COPY game-server-v2/ ./
COPY shared/ ./shared/

EXPOSE 4000

CMD ["npx", "ts-node", "main.ts"]
