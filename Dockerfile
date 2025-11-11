# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
ENV PNPM_HOME=/usr/local/share/pnpm \
    NODE_ENV=production \
    CI=true
RUN corepack enable && apk add --no-cache dumb-init wget
WORKDIR /app

# Args de build
ARG SERVICE_PATH
ARG HAS_BUILD=true

# Instala dependências do serviço alvo
COPY ${SERVICE_PATH}/package.json ${SERVICE_PATH}/package-lock.json* ${SERVICE_PATH}/pnpm-lock.yaml* ./svc/
WORKDIR /app/svc
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; fi

# Copia código do serviço e builda (se TS)
COPY ${SERVICE_PATH}/ ./
RUN if [ "$HAS_BUILD" = "true" ] && [ -f "tsconfig.json" ]; then \
      npx tsc || npm run build || true; \
    fi

FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=base /app/svc/node_modules ./node_modules
COPY --from=base /app/svc ./

# healthcheck padrão (ajuste a rota se necessário)
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:${PORT}/healthz || exit 1

ARG START_CMD="node dist/index.js"
ENV START_CMD=${START_CMD}

EXPOSE 8080
USER nodeusr
ENTRYPOINT ["dumb-init", "--"]
CMD ["/bin/sh", "-lc", "$START_CMD"]

