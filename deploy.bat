@echo off
echo =========================================
echo TBC 프로젝트 서버 배포 스크립트
echo =========================================

:: 1. Git에서 최신 코드 가져오기
echo.
echo 1. Git에서 최신 코드 가져오는 중...
git pull origin dev
if %errorlevel% neq 0 (
    echo Git pull 실패!
    exit /b %errorlevel%
)

:: 2. 기존 컨테이너 정리
echo.
echo 2. 기존 컨테이너 정리 중...
docker-compose down -v 2>nul

:: 3. Docker 이미지 빌드
echo.
echo 3. Docker 이미지 빌드 중...
call build.bat
if %errorlevel% neq 0 (
    echo Docker 이미지 빌드 실패!
    exit /b %errorlevel%
)

:: 4. 컨테이너 실행
echo.
echo 4. 컨테이너 실행 중...
docker-compose up -d
if %errorlevel% neq 0 (
    echo 컨테이너 실행 실패!
    exit /b %errorlevel%
)

:: 5. 서비스 상태 확인
echo.
echo 5. 서비스 상태 확인 중...
timeout /t 10 /nobreak >nul
docker-compose ps

:: 6. 헬스체크
echo.
echo 6. 헬스체크 수행 중...
timeout /t 5 /nobreak >nul
curl -f http://localhost/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ 서비스가 정상적으로 실행 중입니다!
) else (
    echo ⚠️  헬스체크 실패. 로그를 확인해주세요.
    echo 로그 확인: docker-compose logs
)

echo.
echo =========================================
echo 배포 완료!
echo =========================================
echo.
echo 서비스 접속: http://localhost
echo 로그 확인: docker-compose logs -f
echo 중지: docker-compose down
echo.

pause
