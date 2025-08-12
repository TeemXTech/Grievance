# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY web/package*.json ./web/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build backend
WORKDIR /app/backend
RUN npm run build

# Build web
WORKDIR /app/web
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built applications
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/web/.next ./web/.next
COPY --from=builder --chown=nestjs:nodejs /app/web/node_modules ./web/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/web/public ./web/public

USER nestjs

EXPOSE 3000 3001

# Start both applications
CMD ["sh", "-c", "cd backend && npm start & cd web && npm start"]
