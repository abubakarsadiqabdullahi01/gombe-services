# syntax=docker/dockerfile:1.7

# ─── Stage 1: Dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

# Install pinned pnpm for reproducible builds
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# Copy lockfile + manifest first (better layer cache)
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install all deps (including dev — needed for prisma generate)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate


# ─── Stage 2: Build ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/generated ./generated

# Copy all source files
COPY . .

# Build Next.js app (output: standalone for smaller image)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build


# ─── Stage 3: Production Runner ──────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy built output (standalone mode = no node_modules needed)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

# Copy Prisma generated client (needed at runtime)
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma    ./prisma

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
