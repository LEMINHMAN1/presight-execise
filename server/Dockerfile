FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD sh -c "mkdir -p $(dirname ${DB_PATH:-/data/users.db}) && node dist/infrastructure/database/seed.js && node dist/index.js"
