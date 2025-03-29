# Build stage with retries for network reliability
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --fetch-retries 5 --fetch-retry-mintimeout 1000
COPY . .
RUN npm run build

# Production stage using explicit nginx version
FROM nginx:1.25.3-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]