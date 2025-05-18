# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

# Use production mode
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
