# 백엔드 서버 시작 가이드

## 문제 해결
현재 프론트엔드에서 API 호출 시 404 오류가 발생하는 이유는 **백엔드 서버가 실행되지 않았기 때문**입니다.

## 해결 방법

### 1. 백엔드 서버 시작
```bash
# 백엔드 프로젝트 디렉토리로 이동
cd ../tbc-back

# Gradle로 서버 시작
./gradlew bootRun

# 또는 JAR 파일로 실행
java -jar build/libs/*SNAPSHOT.jar
```

### 2. 서버 상태 확인
```bash
# 백엔드 서버가 정상적으로 실행되었는지 확인
curl http://localhost:8080/api/health

# 또는 브라우저에서 확인
http://localhost:8080/api/health
```

### 3. 프론트엔드 재시작
백엔드 서버가 실행된 후 프론트엔드를 재시작하세요:
```bash
# 프론트엔드 디렉토리에서
npm run dev
```

## 예상되는 API 엔드포인트

백엔드 서버가 실행되면 다음 엔드포인트들이 사용 가능해야 합니다:

- `GET /api/health` - 서버 상태 확인
- `GET /api/users/check-email?email={email}` - 이메일 중복 확인
- `GET /api/users/check-nickname?nickname={nickname}` - 닉네임 중복 확인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

## Docker로 실행하는 경우

```bash
# 백엔드와 프론트엔드를 함께 실행
cd ../
docker-compose up --build
```

## 문제가 지속되는 경우

1. **포트 충돌 확인**: 8080 포트가 다른 프로세스에서 사용 중인지 확인
2. **방화벽 설정**: 로컬 방화벽이 8080 포트를 차단하고 있는지 확인
3. **백엔드 로그 확인**: 백엔드 서버 로그에서 오류 메시지 확인
