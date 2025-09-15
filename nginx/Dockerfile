# 1. React 빌드
FROM node:20 AS build
WORKDIR /app
COPY tbc-front ./tbc-front
WORKDIR /app/tbc-front
RUN npm install && npm run build

# 2. nginx 실행 단계
FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/tbc-front/dist /usr/share/nginx/html

