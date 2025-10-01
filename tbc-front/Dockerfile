# Vite + React 개발 서버
FROM node:20

WORKDIR /app

# 의존성 파일 복사 및 설치 (캐시 최적화)
COPY package.json package-lock.json* ./
RUN npm ci --only=production=false && \
    npm cache clean --force

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 5173

# 개발 서버 실행
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
