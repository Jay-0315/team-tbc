# TBC 프로젝트 Docker 배포 가이드

## 📋 목차
1. [사전 요구사항](#사전-요구사항)
2. [로컬 빌드 및 테스트](#로컬-빌드-및-테스트)
3. [서버 배포](#서버-배포)
4. [모니터링 및 관리](#모니터링-및-관리)
5. [트러블슈팅](#트러블슈팅)

---

## 🛠 사전 요구사항

### 개발 환경
- Docker 20.10 이상
- Docker Compose 2.0 이상
- Git

### 서버 환경
- Ubuntu 20.04 이상 (또는 CentOS 8 이상)
- Docker & Docker Compose 설치
- 최소 4GB RAM
- 최소 20GB 디스크 공간

---

## 🏗 로컬 빌드 및 테스트

### 1. 저장소 클론
```bash
git clone https://github.com/Jay-0315/team-tbc.git
cd team-tbc
```

### 2. 이미지 빌드

**Windows:**
```bash
build.bat
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

또는 직접 빌드:
```bash
# 프론트엔드 빌드
docker build -t tbc-front:latest -f tbc-front/Dockerfile tbc-front

# 백엔드 빌드
docker build -t tbc-back:latest -f tbc-back/Dockerfile tbc-back

# Nginx 빌드
docker build -t tbc-nginx:latest -f nginx/Dockerfile .
```

### 3. 컨테이너 실행
```bash
docker-compose up -d
```

### 4. 접속 확인
- 웹사이트: http://localhost
- API 헬스체크: http://localhost/api/actuator/health
- Nginx 헬스체크: http://localhost/health

### 5. 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f tbc-back
docker-compose logs -f nginx
```

---

## 🚀 서버 배포

### 방법 1: Docker Compose 사용 (권장)

1. **서버에 Docker & Docker Compose 설치**
```bash
# Docker 설치 (Ubuntu)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **프로젝트 전송**
```bash
# 로컬에서 서버로 전송
scp -r team-tbc user@your-server:/path/to/deployment/

# 또는 서버에서 직접 클론
ssh user@your-server
git clone https://github.com/Jay-0315/team-tbc.git
cd team-tbc
```

3. **서버에서 빌드 및 실행**
```bash
cd team-tbc

# 빌드
./build.sh

# 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 방법 2: 이미지 Registry 사용

1. **로컬에서 이미지 빌드 및 태깅**
```bash
# 빌드
docker build -t your-registry.com/tbc-front:v1.0 -f tbc-front/Dockerfile tbc-front
docker build -t your-registry.com/tbc-back:v1.0 -f tbc-back/Dockerfile tbc-back
docker build -t your-registry.com/tbc-nginx:v1.0 -f nginx/Dockerfile .

# Registry에 푸시
docker push your-registry.com/tbc-front:v1.0
docker push your-registry.com/tbc-back:v1.0
docker push your-registry.com/tbc-nginx:v1.0
```

2. **서버에서 Pull 및 실행**
```bash
# 이미지 pull
docker pull your-registry.com/tbc-front:v1.0
docker pull your-registry.com/tbc-back:v1.0
docker pull your-registry.com/tbc-nginx:v1.0

# docker-compose.yml 수정 (이미지 경로 변경)
# 실행
docker-compose up -d
```

### 방법 3: Docker Hub 사용

1. **Docker Hub에 로그인**
```bash
docker login
```

2. **이미지 태깅 및 푸시**
```bash
# 태깅
docker tag tbc-front:latest yourusername/tbc-front:latest
docker tag tbc-back:latest yourusername/tbc-back:latest
docker tag tbc-nginx:latest yourusername/tbc-nginx:latest

# 푸시
docker push yourusername/tbc-front:latest
docker push yourusername/tbc-back:latest
docker push yourusername/tbc-nginx:latest
```

3. **서버에서 Pull 및 실행**
```bash
# Pull
docker pull yourusername/tbc-front:latest
docker pull yourusername/tbc-back:latest
docker pull yourusername/tbc-nginx:latest

# 실행
docker-compose up -d
```

---

## 📊 모니터링 및 관리

### 컨테이너 상태 확인
```bash
docker-compose ps
```

### 리소스 사용량 확인
```bash
docker stats
```

### 로그 확인
```bash
# 실시간 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f tbc-back

# 최근 N줄만 보기
docker-compose logs --tail=100 tbc-back
```

### 컨테이너 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart tbc-back
docker-compose restart nginx
```

### 업데이트 배포
```bash
# 1. 새 코드 pull
git pull origin main

# 2. 이미지 재빌드
docker-compose build

# 3. 무중단 재배포
docker-compose up -d --no-deps --build tbc-back
docker-compose up -d --no-deps --build nginx

# 4. 전체 재시작 (짧은 다운타임)
docker-compose down
docker-compose up -d
```

### 데이터 백업
```bash
# 업로드된 이미지 백업
tar -czf tbc-images-$(date +%Y%m%d).tar.gz tbc-back/img/

# 로그 백업
docker-compose logs > logs-$(date +%Y%m%d).txt
```

---

## 🔧 트러블슈팅

### 1. 포트 충돌
```bash
# 80 포트 사용 중인 프로세스 확인
sudo lsof -i :80

# 프로세스 종료 후 재시작
docker-compose down
docker-compose up -d
```

### 2. 컨테이너가 시작되지 않음
```bash
# 상세 로그 확인
docker-compose logs --tail=50 tbc-back

# 컨테이너 상태 확인
docker-compose ps

# 특정 컨테이너 재시작
docker-compose restart tbc-back
```

### 3. Nginx 502 Bad Gateway
```bash
# 백엔드 컨테이너 상태 확인
docker-compose ps tbc-back

# 백엔드 로그 확인
docker-compose logs tbc-back

# 네트워크 확인
docker network inspect team-tbc_tbc-net
```

### 4. 백엔드 DB 연결 오류
```bash
# application.yml DB 설정 확인
# MySQL 서버 접근 가능 여부 확인
docker exec -it tbc-back ping 57.180.2.19

# 방화벽 확인
sudo ufw status
```

### 5. 메모리 부족
```bash
# 메모리 사용량 확인
docker stats

# 불필요한 이미지/컨테이너 정리
docker system prune -a

# 사용하지 않는 볼륨 정리
docker volume prune
```

### 6. 디스크 공간 부족
```bash
# 디스크 사용량 확인
df -h

# Docker 디스크 사용량 확인
docker system df

# 정리
docker system prune -a --volumes
```

---

## 🔐 보안 권장사항

### 1. 환경 변수 관리
- `.env` 파일 사용
- 민감한 정보는 Docker secrets 또는 환경 변수로 관리
- Git에 커밋하지 않기

### 2. 방화벽 설정
```bash
# UFW 방화벽 설정 (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. HTTPS 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

---

## 📝 환경별 설정

### 개발 환경
- `docker-compose.override.yml` 사용
- 핫 리로드 활성화
- 디버그 모드

### 프로덕션 환경
- `docker-compose.yml` 사용
- 최적화된 빌드
- 헬스체크 활성화
- 리소스 제한 설정

---

## 🆘 지원

문제가 발생하면:
1. 로그 확인: `docker-compose logs -f`
2. GitHub Issues에 문의
3. 팀원에게 연락

---

## 📚 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Spring Boot Docker 가이드](https://spring.io/guides/gs/spring-boot-docker/)

