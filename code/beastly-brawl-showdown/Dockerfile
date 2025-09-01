# Build stage (Meteor app build)
FROM node:18-alpine AS builder
WORKDIR /app

# Install Meteor
RUN apk add --no-cache curl bash \
  && curl https://install.meteor.com/ | sh

# Copy source
COPY . .

# Install dependencies & build
RUN meteor npm install \
  && meteor build --directory /app/build --server-only

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built bundle
COPY --from=builder /app/build/bundle /app/bundle

# Install server dependencies
WORKDIR /app/bundle/programs/server
RUN npm install --production

# Set environment
ENV MONGO_URL=mongodb://mongo:27017/beastly
ENV ROOT_URL=http://localhost
ENV PORT=3000

# Expose and run
EXPOSE 3000
CMD ["node", "/app/bundle/main.js"]
