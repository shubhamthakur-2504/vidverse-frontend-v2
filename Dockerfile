# Production image: builds the app and runs Next.js's standalone server as an unprivileged user.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# where this app's server reaches the API (e.g. http://backend:5000). The /api rewrite in next.config is fixed
# at build time, so it is a build arg; the browser never sees it (it calls this app's own /api/*).
ARG API_ORIGIN
ENV API_ORIGIN=$API_ORIGIN
ENV NEXT_TELEMETRY_DISABLED=1
RUN test -n "$API_ORIGIN" || (echo "build arg API_ORIGIN is required" && exit 1)
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# API_ORIGIN (runtime env, normally the same value as the build arg) is used by server components and proxy.ts
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node

EXPOSE 3000
CMD ["node", "server.js"]
