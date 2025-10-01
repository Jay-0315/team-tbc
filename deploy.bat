@echo off
echo =========================================
echo TBC 프로젝트 Docker 이미지 빌드 시작
echo =========================================

:: 1. 기존 컨테이너 정리
echo.
echo 1. 기존 컨테이너 정리 중...
docker-compose down -v 2>nul

:: 2. 프론트엔드 빌드
echo.
echo 2. React 프론트엔드 빌드 중...
docker build -t tbc-front:latest -f tbc-front/Dockerfile tbc-front
if %errorlevel% neq 0 (
    echo 프론트엔드 빌드 실패!
    exit /b %errorlevel%
)

:: 3. 백엔드 빌드
echo.
echo 3. Spring Boot 백엔드 빌드 중...
docker build -t tbc-back:latest -f tbc-back/Dockerfile tbc-back
if %errorlevel% neq 0 (
    echo 백엔드 빌드 실패!
    exit /b %errorlevel%
)

:: 4. Nginx 빌드
echo.
echo 4. Nginx 리버스 프록시 빌드 중...
docker build -t tbc-nginx:latest -f nginx/Dockerfile .
if %errorlevel% neq 0 (
    echo Nginx 빌드 실패!
    exit /b %errorlevel%
)

echo.
echo =========================================
echo 모든 이미지 빌드 완료!
echo =========================================
echo.
echo 빌드된 이미지:
docker images | findstr "tbc-front tbc-back tbc-nginx"

echo.
echo 컨테이너 실행: docker-compose up -d
echo 로그 확인: docker-compose logs -f
echo 중지: docker-compose down

pause