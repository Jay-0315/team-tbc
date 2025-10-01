#!/bin/bash

echo "========================================="
echo "TBC 프로젝트 Docker 이미지 빌드 및 배포 시작"
echo "========================================="

# 1. 기존 컨테이너 정리
echo ""
echo "1. 기존 컨테이너 정리 중..."
docker-compose down -v

# 2. 프론트엔드 빌드
echo ""
echo "2. React 프론트엔드 빌드 중..."
docker build -t tbc-front:latest -f tbc-front/Dockerfile tbc-front
if [ $? -ne 0 ]; then
    echo "프론트엔드 빌드 실패!"
    exit 1
fi

# 3. 백엔드 빌드
echo ""
echo "3. Spring Boot 백엔드 빌드 중..."
docker build -t tbc-back:latest -f tbc-back/Dockerfile tbc-back
if [ $? -ne 0 ]; then
    echo "백엔드 빌드 실패!"
    exit 1
fi

# 4. Nginx 빌드
echo ""
echo "4. Nginx 리버스 프록시 빌드 중..."
docker build -t tbc-nginx:latest -f nginx/Dockerfile .
if [ $? -ne 0 ]; then
    echo "Nginx 빌드 실패!"
    exit 1
fi

echo ""
echo "========================================="
echo "모든 이미지 빌드 완료! 컨테이너 실행 중..."
echo "========================================="
echo ""

# 5. 컨테이너 실행
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "컨테이너 실행 실패!"
    exit 1
fi

echo ""
echo "========================================="
echo "TBC 프로젝트 배포 완료!"
echo "========================================="
echo ""
echo "서비스 상태 확인: docker-compose ps"
echo "로그 확인: docker-compose logs -f"
echo "중지: docker-compose down"
echo ""
echo "웹 브라우저에서 http://localhost 로 접속하여 확인하세요."