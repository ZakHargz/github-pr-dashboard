# syntax=docker/dockerfile:1

# ── Stage 1: production runtime ─────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Least-privilege: run as a dedicated non-root user
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs

# Public assets (served by Next.js standalone server)
COPY --chown=nextjs:nodejs public ./public

# Pre-built standalone server bundle and static assets
# These must be built locally with: npm run build
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# next build --output=standalone emits a self-contained server.js
CMD ["node", "server.js"]
