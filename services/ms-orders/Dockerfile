FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=8082
EXPOSE 8082
CMD ["node","dist/index.js"]

