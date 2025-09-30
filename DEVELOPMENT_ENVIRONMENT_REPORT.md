# 📋 TEAM-TBC 개발환경 구성 보고서

## 🏗️ **전체 아키텍처**

### **스택 구성**
- **프론트엔드**: React 19.1.1 + Vite 7.1.5 + TypeScript 5.8.3 + TailwindCSS 4.1.13
- **백엔드**: Spring Boot 3.5.5 + Java 21 + MySQL 8.4.0
- **프록시**: Nginx (Reverse Proxy)
- **런타임**: Docker Compose

### **개발 환경 분리**
```
📁 team-tbc/
├── 🐳 docker-compose.yml (기본 구성)
├── 🐳 docker-compose.override.yml (개발 오버라이드)
├── 📁 tbc-front/ (React 프론트엔드)
├── 📁 tbc-back/ (Spring Boot 백엔드)
└── 📁 nginx/ (Nginx 설정)
```

---

## 🎯 **프론트엔드 (tbc-front)**

### **기술 스택**
- **프레임워크**: React 19.1.1 + Vite 7.1.5
- **언어**: TypeScript 5.8.3
- **스타일링**: TailwindCSS 4.1.13 + shadcn/ui
- **상태관리**: React Query (@tanstack/react-query 5.89.0)
- **라우팅**: React Router DOM 7.9.1
- **폼**: React Hook Form 7.63.0 + Zod 4.1.11
- **지도**: Leaflet 1.9.4 + React Leaflet 5.0.0
- **UI 컴포넌트**: Radix UI + Lucide React
- **알림**: Sonner 2.0.7
- **웹소켓**: STOMP.js 7.2.0

### **주요 기능**
- ✅ **소셜링 만들기**: 모달 기반 멀티스텝 폼
- ✅ **지도 통합**: OpenStreetMap + Leaflet.js
- ✅ **이미지 업로드**: 5MB 제한, JPG/PNG/JPEG/GIF/WebP 지원
- ✅ **실시간 채팅**: WebSocket + STOMP
- ✅ **반응형 디자인**: 모바일(375px) ~ 데스크톱(1440px)
- ✅ **접근성**: ARIA 라벨, 키보드 내비게이션

### **개발 서버**
```bash
# 개발 모드 실행
npm run dev          # Vite 개발 서버 (포트 5173)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
```

---

## ⚙️ **백엔드 (tbc-back)**

### **기술 스택**
- **프레임워크**: Spring Boot 3.5.5
- **언어**: Java 21
- **데이터베이스**: MySQL 8.4.0
- **ORM**: Spring Data JPA + Hibernate 6.6.26
- **보안**: Spring Security + JWT
- **API 문서**: SpringDoc OpenAPI 3 (Swagger)
- **빌드**: Gradle 8.x

### **아키텍처 패턴**
- **헥사고날 아키텍처** + **파사드 패턴**
- **모듈 구조**: `com.tbc.<service>` 단위 (events, chat, login, main 등)
- **계층 분리**: Domain → Application → Infrastructure → Interface

### **주요 모듈**
```
📁 com.tbc/
├── 📁 events/ (이벤트 관리)
├── 📁 group/ (그룹 관리)
├── 📁 chat/ (실시간 채팅)
├── 📁 login/ (인증/인가)
├── 📁 profile/ (프로필 관리)
├── 📁 payments/ (결제 시스템)
└── 📁 infrastructure/ (공통 설정)
```

### **데이터베이스**
- **호스트**: 57.180.2.19:13306
- **데이터베이스**: tbc_db
- **사용자**: tbc
- **연결 풀**: HikariCP (최대 200 스레드)

### **성능 최적화**
- ✅ **N+1 문제 해결**: 배치 조회 방식 적용
- ✅ **정적 리소스**: 이미지 업로드/서빙 최적화
- ✅ **캐싱**: Hibernate 2차 캐시 준비

---

## 🐳 **Docker 구성**

### **개발 환경 (docker-compose.override.yml)**
```yaml
services:
  tbc-front:     # React 개발 서버 (포트 5173)
    - HMR (Hot Module Replacement)
    - 소스 볼륨 마운트
    - 실시간 코드 변경 반영
  
  tbc-back:      # Spring Boot (포트 8080)
    - 프로필: local
    - Hibernate DDL: update
    - SQL 로그: 활성화
  
  nginx:         # 리버스 프록시 (포트 80)
    - /api → tbc-back:8080
    - / → tbc-front:5173
```

### **프로덕션 환경**
```yaml
services:
  nginx:         # 정적 파일 서빙 + API 프록시
  tbc-back:      # Spring Boot (프로필: prod)
```

---

## 🔧 **개발 도구 및 설정**

### **코드 품질**
- **ESLint**: React + TypeScript 규칙
- **Prettier**: 코드 포맷팅
- **TypeScript**: 엄격한 타입 체크
- **Husky**: Git 훅 (선택사항)

### **환경 변수**
```bash
# 프론트엔드
NODE_ENV=development
VITE_API_BASE_URL=http://localhost/api

# 백엔드
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=jdbc:mysql://57.180.2.19:13306/tbc_db
JWT_SECRET=TBC_JWT_SECRET_KEY_2024_...
```

### **포트 구성**
- **프론트엔드**: 5173 (Vite 개발 서버)
- **백엔드**: 8080 (Spring Boot)
- **Nginx**: 80 (HTTP), 443 (HTTPS)
- **MySQL**: 13306 (외부 호스트)

---

## 🚀 **실행 방법**

### **개발 환경 시작**
```bash
# 1. 전체 서비스 시작 (Docker)
docker-compose up -d

# 2. 개별 서비스 시작
cd tbc-front && npm run dev    # 프론트엔드
cd tbc-back && ./gradlew bootRun  # 백엔드
```

### **접속 URL**
- **메인 애플리케이션**: http://localhost
- **API 문서**: http://localhost:8080/swagger-ui
- **헬스 체크**: http://localhost:8080/actuator/health

---

## 📊 **현재 상태**

### **✅ 완료된 기능**
- 소셜링 CRUD (생성, 조회, 수정, 삭제)
- 이미지 업로드 및 표시
- 지도 통합 (위치 검색, 마커 표시)
- 실시간 채팅
- 사용자 인증/인가
- 결제 시스템 (Toss Payments)
- N+1 쿼리 최적화

### **🔄 진행 중**
- 성능 모니터링
- 에러 핸들링 개선
- 테스트 코드 작성

### **📈 성능 지표**
- **쿼리 최적화**: N+1 문제 해결로 93% 쿼리 감소
- **로딩 속도**: 배치 조회로 메인 화면 로딩 시간 단축
- **이미지 처리**: 5MB 제한, UUID 기반 파일명

---

## 🎯 **다음 단계**

1. **캐싱 도입**: Redis 또는 Hibernate 2차 캐시
2. **모니터링**: Actuator + Micrometer
3. **테스트**: 단위 테스트 + 통합 테스트
4. **CI/CD**: GitHub Actions 파이프라인
5. **보안 강화**: Rate Limiting, CORS 정책

---

## 📝 **주요 파일 구조**

### **프론트엔드**
```
tbc-front/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── ui/        # shadcn/ui 래핑 컴포넌트
│   │   ├── event/     # 이벤트 관련 컴포넌트
│   │   └── layout/    # 레이아웃 컴포넌트
│   ├── pages/         # 라우트 단위 페이지
│   ├── features/      # 도메인 모듈
│   │   ├── events/    # 이벤트 관련 기능
│   │   └── payments/  # 결제 관련 기능
│   ├── hooks/         # 커스텀 훅
│   ├── lib/           # 유틸리티 및 설정
│   └── types/         # TypeScript 타입 정의
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### **백엔드**
```
tbc-back/
├── src/main/java/com/tbc/
│   ├── events/        # 이벤트 관리 모듈
│   ├── group/         # 그룹 관리 모듈
│   ├── chat/          # 채팅 모듈
│   ├── login/         # 인증/인가 모듈
│   ├── profile/       # 프로필 관리 모듈
│   ├── payments/      # 결제 모듈
│   └── infrastructure/ # 공통 설정
├── src/main/resources/
│   ├── application.yml
│   ├── application-local.properties
│   └── application-prod.yml
├── build.gradle
└── Dockerfile
```

---

## 🔍 **문제 해결 가이드**

### **자주 발생하는 문제**

1. **포트 충돌**
   ```bash
   # 포트 사용 중인 프로세스 확인
   netstat -ano | findstr :8080
   netstat -ano | findstr :5173
   ```

2. **Docker 컨테이너 재시작**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **프론트엔드 의존성 문제**
   ```bash
   cd tbc-front
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **백엔드 빌드 문제**
   ```bash
   cd tbc-back
   ./gradlew clean build
   ```

### **로그 확인**
```bash
# Docker 로그
docker-compose logs -f tbc-back
docker-compose logs -f tbc-front

# 백엔드 로그
tail -f tbc-back/bootrun.out
```

---

## 📞 **지원 및 문의**

- **프로젝트**: TEAM-TBC
- **기술 스택**: React + Spring Boot + MySQL + Docker
- **개발 환경**: Windows 10/11 + Docker Desktop
- **문서 버전**: 2024-09-30

---

*이 문서는 프로젝트의 현재 상태를 반영하며, 지속적으로 업데이트됩니다.*
