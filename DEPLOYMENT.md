# TBC 프로젝트 배포 가이드

## 🚀 서버 배포 방법

### Windows 서버 배포
```bash
# 1. 자동 배포 (권장)
deploy.bat

# 2. 수동 배포
git pull origin dev
build.bat
docker-compose up -d
```

### Linux 서버 배포
```bash
# 1. 자동 배포 (권장)
./deploy.sh

# 2. 수동 배포
git pull origin dev
chmod +x build.sh
./build.sh
docker-compose up -d
```

## 📋 배포 전 체크리스트

### 필수 요구사항
- [ ] Docker 및 Docker Compose 설치
- [ ] Git 저장소 클론 완료
- [ ] 포트 80, 5173 사용 가능
- [ ] 최소 2GB RAM 권장

### 환경 설정
- [ ] `.env` 파일 설정 (필요시)
- [ ] 데이터베이스 연결 정보 확인
- [ ] 외부 API 키 설정 (필요시)

## 🔧 서비스 관리

### 서비스 상태 확인
```bash
docker-compose ps
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f tbc-front
docker-compose logs -f tbc-back
docker-compose logs -f nginx
```

### 서비스 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart tbc-back
```

### 서비스 중지
```bash
docker-compose down
```

## 🌐 서비스 접속

- **프론트엔드**: http://localhost
- **백엔드 API**: http://localhost/api
- **헬스체크**: http://localhost/health

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :80
netstat -ano | findstr :5173

# 프로세스 종료 후 재시작
docker-compose down
docker-compose up -d
```

#### 2. 이미지 빌드 실패
```bash
# Docker 캐시 정리
docker system prune -a

# 다시 빌드
build.bat  # Windows
./build.sh # Linux
```

#### 3. 컨테이너 시작 실패
```bash
# 로그 확인
docker-compose logs

# 볼륨 정리 후 재시작
docker-compose down -v
docker-compose up -d
```

#### 4. 데이터베이스 연결 실패
- 데이터베이스 서비스 상태 확인
- 연결 정보 확인
- 네트워크 설정 확인

## 📊 모니터링

### 리소스 사용량 확인
```bash
docker stats
```

### 디스크 사용량 확인
```bash
docker system df
```

### 컨테이너 상태 확인
```bash
docker-compose ps
```

## 🔄 업데이트 배포

### 코드 업데이트 후 배포
```bash
# 1. 자동 배포 (권장)
deploy.bat  # Windows
./deploy.sh # Linux

# 2. 수동 배포
git pull origin dev
docker-compose down
build.bat  # Windows
./build.sh # Linux
docker-compose up -d
```

### 데이터베이스 마이그레이션
```bash
# 백엔드 컨테이너에서 실행
docker exec -it tbc-back java -jar app.jar --spring.profiles.active=prod
```

## 🛡️ 보안 고려사항

### 프로덕션 환경
- [ ] CORS 설정 검토
- [ ] JWT 토큰 만료 시간 설정
- [ ] 데이터베이스 보안 설정
- [ ] HTTPS 설정 (권장)
- [ ] 방화벽 설정

### 환경 변수 관리
- [ ] 민감한 정보는 환경 변수로 관리
- [ ] `.env` 파일을 Git에 커밋하지 않음
- [ ] 프로덕션 환경별 설정 분리

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. 로그 파일 확인
2. 서비스 상태 확인
3. 네트워크 연결 확인
4. 리소스 사용량 확인

추가 지원이 필요한 경우 개발팀에 문의해주세요.
