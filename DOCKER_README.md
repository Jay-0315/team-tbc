# TBC 프로젝트 Docker 배포

## 🚀 빠른 시작

### 1. 로컬에서 빌드 및 실행

```bash
# Windows
build.bat

# Linux/Mac
chmod +x build.sh
./build.sh

# 컨테이너 실행
docker-compose up -d

# 접속
open http://localhost
```

### 2. 서버 배포

```bash
# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh <서버IP> <사용자>

# 예시
./deploy.sh 192.168.1.100 ubuntu
```

## 📁 프로젝트 구조

```
team-tbc/
├── tbc-front/              # React 프론트엔드
│   ├── Dockerfile          # Vite 빌드 설정
│   └── .dockerignore
├── tbc-back/               # Spring Boot 백엔드
│   ├── Dockerfile          # Multi-stage 빌드
│   └── .dockerignore
├── nginx/                  # Nginx 리버스 프록시
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml      # 통합 실행 설정
├── build.sh / build.bat    # 빌드 스크립트
├── deploy.sh               # 배포 스크립트
└── DEPLOYMENT_GUIDE.md     # 상세 가이드
```

## 🔧 주요 명령어

```bash
# 빌드
docker-compose build

# 실행
docker-compose up -d

# 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps

# 재시작
docker-compose restart
```

## 🌐 접속 정보

- **웹사이트**: http://localhost
- **API**: http://localhost/api
- **WebSocket**: ws://localhost/ws
- **Health Check**: http://localhost/health

## 📚 자세한 문서

전체 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

## 🔐 환경 변수

프로덕션 배포 시 다음 환경 변수를 설정하세요:

```env
# tbc-back
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://your-db:3306/tbc_db
DB_USERNAME=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 80 포트 확인
sudo lsof -i :80

# 포트 변경 (docker-compose.yml)
ports:
  - "8000:80"  # 80 → 8000으로 변경
```

### 컨테이너 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스
docker-compose logs -f tbc-back
```

### 이미지 재빌드
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 📝 라이선스

Copyright © 2024 Team TBC

