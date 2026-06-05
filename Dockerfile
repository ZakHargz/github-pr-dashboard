# syntax=docker/dockerfile:1

# ── Stage 1: install deps ───────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
# libc6-compat is required in this stage too — Next.js loads the SWC native
# binary (glibc-compiled) at build time to compile TypeScript/JSX. Without the
# musl compatibility shim the kernel rejects the binary and the shell reports
# it as "next: not found".
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next/font downloads fonts at build time and bundles them into
# .next/static/media — no internet access needed at runtime.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: production runner ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Least-privilege: run as a dedicated non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Public assets (served by Next.js standalone server)
COPY --from=builder /app/public ./public

# Standalone server bundle (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static client assets (JS chunks, CSS, font files)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# next build --output=standalone emits a self-contained server.js
CMD ["node", "server.js"]
