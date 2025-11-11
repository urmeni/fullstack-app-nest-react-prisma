# backend/Dockerfile
############################
# Stage 1 — builder
############################
FROM node:20-bullseye AS builder
WORKDIR /app

# copy package manifests first for Docker cache
COPY package*.json ./
# if you use package-lock.json: npm ci; else adjust to yarn/pnpm
RUN npm ci

# copy everything (including prisma/schema.prisma)
COPY . .

# generate prisma client for the target environment (runs inside builder)
RUN npx prisma generate

# build nest (assumes `npm run build` builds to /dist)
RUN npm run build

############################
# Stage 2 — runtime
############################
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Install netcat for simple "wait for db" check (optional but handy)
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

# Copy only production deps then application artifacts
COPY package*.json ./
RUN npm ci --production

# Copy built app + Prisma client artifacts from builder
COPY --from=builder /app/dist ./dist
# Prisma writes generated client into node_modules/.prisma and @prisma/client wrapper is in node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# copy prisma schema (optional for some runtime tasks e.g. prisma migrate deploy)
COPY --from=builder /app/prisma ./prisma

# add entrypoint script (see next file)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4000
CMD ["docker-entrypoint.sh"]
