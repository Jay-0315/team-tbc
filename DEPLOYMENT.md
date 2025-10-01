# TBC 프로젝트 배포 가이드

## 🚀 Ubuntu 서버 배포 가이드

### 1. 서버 준비
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git 설치
sudo apt install git -y
```

### 2. 프로젝트 클론
```bash
# 프로젝트 디렉토리로 이동
cd /opt
sudo git clone https://github.com/Jay-0315/team-tbc.git
sudo chown -R $USER:$USER team-tbc
cd team-tbc
```

### 3. 환경 설정
```bash
# 환경 변수 파일 생성 (필요시)
cp .env.example .env
# .env 파일을 편집하여 필요한 환경 변수 설정
```

### 4. Docker 이미지 빌드 및 배포
```bash
# 실행 권한 부여
chmod +x deploy.sh

# 자동 배포 실행
./deploy.sh
```

### 5. 서비스 확인
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 웹 서비스 접속 확인
curl http://localhost/health
```

### 6. 방화벽 설정 (필요시)
```bash
# UFW 방화벽 설정
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (SSL 인증서 설정 시)
sudo ufw enable
```

## 🔧 개발 환경 설정

### Windows 환경
```cmd
# 배포 스크립트 실행
deploy.bat
```

### Linux/macOS 환경
```bash
# 배포 스크립트 실행
./deploy.sh
```

## 📋 서비스 구성

### 컨테이너 구성
- **tbc-front**: React 프론트엔드 (포트 5173)
- **tbc-back**: Spring Boot 백엔드 (포트 8080)
- **tbc-nginx**: Nginx 리버스 프록시 (포트 80)

### 네트워크
- **tbc-net**: Docker 네트워크로 컨테이너 간 통신

### 볼륨
- **./tbc-back/img**: 업로드된 이미지 파일 영구 저장

## 🛠️ 유지보수

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f tbc-front
docker-compose logs -f tbc-back
docker-compose logs -f tbc-nginx
```

### 서비스 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart tbc-front
```

### 이미지 업데이트
```bash
# 코드 변경 후 재배포
git pull origin master
./deploy.sh
```

### 데이터 백업
```bash
# 이미지 파일 백업
tar -czf backup-$(date +%Y%m%d).tar.gz tbc-back/img/

# 데이터베이스 백업 (MySQL 사용 시)
docker-compose exec tbc-back mysqldump -u root -p database_name > backup-$(date +%Y%m%d).sql
```

## 🚨 문제 해결

### 포트 충돌
```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :8080

# 프로세스 종료
sudo kill -9 <PID>
```

### 컨테이너 재시작 실패
```bash
# 컨테이너 강제 제거
docker-compose down -v --remove-orphans
docker system prune -f

# 재시작
./deploy.sh
```

### 디스크 공간 부족
```bash
# Docker 정리
docker system prune -a -f
docker volume prune -f

# 로그 파일 정리
sudo journalctl --vacuum-time=7d
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Docker 및 Docker Compose 설치 상태
2. 포트 80, 8080 사용 가능 여부
3. 방화벽 설정
4. 서버 리소스 (메모리, 디스크 공간)

추가 지원이 필요한 경우 프로젝트 이슈를 생성해주세요.