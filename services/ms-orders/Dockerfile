# 1) Builder: compila TS -> JS
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2) Runtime: instala deps prod e copia dist
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Instala prisma CLI para migrations
RUN npm install --production --omit=dev && npm install -g prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
ENV PORT=8082
EXPOSE 8082
# O servidor já executa migrations automaticamente no startup
CMD ["node","dist/index.js"]
