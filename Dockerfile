# Build stage for all packages
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy all package.json files for dependency installation
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ui/package.json ./packages/ui/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps ./apps
COPY packages ./packages

# Generate Prisma client
RUN pnpm -F @repo/database db:generate

# Build all packages with environment variables for Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
RUN pnpm build

# Production stage for API
FROM node:20-alpine AS api

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy built API and dependencies
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy packages
COPY --from=builder /app/packages ./packages

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]

# Production stage for Web
FROM node:20-alpine AS web

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy built web app and dependencies
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy packages
COPY --from=builder /app/packages ./packages

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]