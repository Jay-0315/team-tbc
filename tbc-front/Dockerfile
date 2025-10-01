# Vite + React 프로덕션 빌드
FROM node:20-alpine AS build

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Vite 프로덕션 빌드 (타입 체크 없이)
RUN npx vite build

# 빌드 결과물만 유지 (dist 폴더)
FROM scratch AS export
COPY --from=build /app/dist /dist
