#!/bin/bash

# TBC 프로젝트 배포 스크립트
# 사용법: ./deploy.sh [server-ip] [user]

set -e

if [ $# -lt 2 ]; then
    echo "사용법: $0 <server-ip> <user>"
    echo "예시: $0 192.168.1.100 ubuntu"
    exit 1
fi

SERVER=$1
USER=$2
REMOTE_PATH="/home/$USER/team-tbc"

echo "========================================="
echo "TBC 프로젝트 서버 배포"
echo "========================================="
echo "서버: $USER@$SERVER"
echo "경로: $REMOTE_PATH"
echo ""

# 1. 로컬에서 이미지 빌드
echo "1. 로컬에서 Docker 이미지 빌드 중..."
./build.sh

# 2. 이미지 저장
echo ""
echo "2. Docker 이미지 tar 파일로 저장 중..."
docker save tbc-front:latest | gzip > tbc-front.tar.gz
docker save tbc-back:latest | gzip > tbc-back.tar.gz
docker save tbc-nginx:latest | gzip > tbc-nginx.tar.gz

# 3. 서버로 전송
echo ""
echo "3. 서버로 파일 전송 중..."
ssh $USER@$SERVER "mkdir -p $REMOTE_PATH"
scp tbc-front.tar.gz tbc-back.tar.gz tbc-nginx.tar.gz $USER@$SERVER:$REMOTE_PATH/
scp docker-compose.yml $USER@$SERVER:$REMOTE_PATH/
scp -r nginx $USER@$SERVER:$REMOTE_PATH/

# 4. 서버에서 이미지 로드 및 실행
echo ""
echo "4. 서버에서 이미지 로드 및 컨테이너 실행 중..."
ssh $USER@$SERVER << 'EOF'
cd /home/$USER/team-tbc
gunzip -c tbc-front.tar.gz | docker load
gunzip -c tbc-back.tar.gz | docker load
gunzip -c tbc-nginx.tar.gz | docker load
docker-compose down
docker-compose up -d
rm -f *.tar.gz
echo ""
echo "배포 완료! 컨테이너 상태:"
docker-compose ps
EOF

# 5. 로컬 정리
echo ""
echo "5. 로컬 임시 파일 정리 중..."
rm -f tbc-front.tar.gz tbc-back.tar.gz tbc-nginx.tar.gz

echo ""
echo "========================================="
echo "✅ 배포 완료!"
echo "========================================="
echo ""
echo "서버 접속: http://$SERVER"
echo "로그 확인: ssh $USER@$SERVER 'cd $REMOTE_PATH && docker-compose logs -f'"

