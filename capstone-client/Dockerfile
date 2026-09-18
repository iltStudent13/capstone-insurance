FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts tsconfig.node.json ./
COPY . .
RUN npm run build

# Stage 2 runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]