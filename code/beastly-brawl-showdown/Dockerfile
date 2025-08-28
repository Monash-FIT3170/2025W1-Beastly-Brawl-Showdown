FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY beastly-brawl-showdown/package*.json ./
RUN npm install

# Copy app code & shared folder
COPY beastly-brawl-showdown/ ./
COPY shared/ ./shared/

EXPOSE 3000

# Adjust this if your start command differs
CMD ["npm", "start"]
