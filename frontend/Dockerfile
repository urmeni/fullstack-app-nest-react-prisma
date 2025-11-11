# Stage 1: build
FROM node:20 AS builder

WORKDIR /app

# Copy package.json & lock file first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Copy .env.production for build
COPY .env .env.production

# Build the production app
RUN npm run build

# Stage 2: serve
FROM nginx:stable-alpine

# Copy the built files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom nginx config to handle client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
