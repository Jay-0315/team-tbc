# Team TBC - Test README (SJ Branch)

이 파일은 **SJ 브랜치 테스트용**으로 작성되었습니다.  
브랜치 연동 및 `git add → commit → push` 흐름을 확인하기 위한 임시 문서입니다.

## 테스트 내용
- 브랜치: `SJ`
- 작업자: [Your Name]
- 목적: 원격 저장소와 로컬 브랜치 정상 동작 확인

## 커밋 체크리스트
- [x] `git status` 실행
- [x] `git add README.md`
- [x] `git commit -m "Add test README"`
- [x] `git push`

---

## Backend (Spring Boot) 메모

### 메인 클래스/컴포넌트 스캔 규칙 (중요)

- 메인 클래스는 루트 패키지 `com.tbc` 하위에 위치해야 합니다.
  - 파일: `tbc-back/src/main/java/com/tbc/TbcApplication.java`
  - 어노테이션: `@SpringBootApplication`
- 이유: 기본 컴포넌트 스캔은 메인 클래스 패키지의 하위만 스캔합니다. 메인 클래스가 다른(잘못된) 패키지에 있으면 `com.tbc.events` 하위의 `@Repository`/`@Service` 등이 스캔되지 않아 다음 오류가 발생합니다.
  - 증상 예)
    - `Found 0 JPA repository interfaces.`
    - `No qualifying bean of type 'com.tbc.events.repo.EventRepo' available`
- 해결: 메인 클래스를 `com.tbc`로 이동(또는 `@SpringBootApplication(scanBasePackages="com.tbc")` 사용)하고 불필요한 중복 메인 클래스 제거.

---

## E2E 점검 가이드: 실 DB 시드 + 프런트 연동

### 1) 백엔드 (local 프로필 실행)

1. 실행
   ```bash
   ./gradlew bootRun -Dspring-boot.run.profiles=local
   ```
2. Swagger UI 접속(있을 경우)
   - http://localhost:8080/swagger-ui/index.html
3. 목록 API 점검
   - Swagger에서 GET /api/events 실행 → `content[].title/status/startAt/remainingSeats` 확인
   - curl 예시:
     ```bash
     curl "http://localhost:8080/api/events?page=0&size=12&sort=CREATED_DESC"
     ```
4. 데이터가 안 보이는 경우
   - `tbc-back/src/main/resources/application-local.properties`에 아래 설정을 일시 적용 후 재기동
     ```properties
     app.seed.always=true
     ```

### 2) 프런트 (Vite dev server)

1. 접속: http://localhost:5173/events
   - 카드 리스트 표시 확인
2. 필터/정렬/탭 변경
   - 쿼리스트링이 반영되고 `/api/events`가 재호출되는지 네트워크 탭 확인
3. 상세 이동
   - 카드 클릭 → `/events/:id` 로드 시 상세 호출(준비된 범위 내)
4. 개발 편의 헤더 확인
   - axios 요청 헤더에 `X-User-Id: 1` 자동 주입(개발용) 확인

## 리뷰 API QA 체크리스트

### E2E 흐름 테스트
1. **시드 데이터 확인**
   ```bash
   # 백엔드 실행 (local 프로필)
   ./gradlew bootRun -Dspring-boot.run.profiles=local
   
   # 리뷰 시드 데이터 확인
   curl "http://localhost:8080/api/events/1/reviews" -H "X-User-Id: 1"
   ```

2. **이벤트 목록/상세 확인**
   ```bash
   # 이벤트 목록
   curl "http://localhost:8080/api/events?page=0&size=12" -H "X-User-Id: 1"
   
   # 이벤트 상세
   curl "http://localhost:8080/api/events/1" -H "X-User-Id: 1"
   ```

3. **리뷰 목록 확인**
   ```bash
   # 리뷰 목록 조회
   curl "http://localhost:8080/api/events/1/reviews?page=0&size=10" -H "X-User-Id: 1"
   ```

4. **리뷰 작성 POST 성공**
   ```bash
   # 리뷰 작성
   curl -X POST "http://localhost:8080/api/events/1/reviews" \
     -H "X-User-Id: 1" \
     -H "Content-Type: application/json" \
     -d '{"rating": 5, "comment": "정말 좋은 이벤트였습니다!"}'
   ```

### 프론트엔드 테스트
1. **이벤트 상세 페이지**: `http://localhost:3001/events/1`
   - [ ] 리뷰 섹션이 하단에 표시됨
   - [ ] 평균 평점/개수 요약 표시 (★ 4.3 • 5개)
   - [ ] "후기 작성" 버튼 클릭 시 모달 열림
   - [ ] 리뷰 목록이 최신 순으로 표시됨
   - [ ] "더 보기" 버튼으로 무한 스크롤 작동

2. **리뷰 작성 모달**
   - [ ] 평점 선택 (1-5점, 별 클릭)
   - [ ] 댓글 입력 (최대 500자, 실시간 카운트)
   - [ ] 제출 시 성공 토스트 표시
   - [ ] 실패 시 에러 토스트 표시
   - [ ] ESC 키로 모달 닫기

3. **리뷰 테스트 페이지**: `http://localhost:3001/review-test`
   - [ ] 이벤트 ID 변경 시 리뷰 목록 업데이트
   - [ ] 빈 상태일 때 "아직 후기가 없습니다" 표시
   - [ ] 로딩/에러 상태 처리

### 문제해결 가이드

#### 401 Unauthorized (X-User-Id 헤더 누락)
```bash
# 해결: X-User-Id 헤더 추가
curl "http://localhost:8080/api/events/1/reviews" -H "X-User-Id: 1"
```

#### 400 Bad Request (검증 실패)
```bash
# 잘못된 평점 (0점)
curl -X POST "http://localhost:8080/api/events/1/reviews" \
  -H "X-User-Id: 1" -H "Content-Type: application/json" \
  -d '{"rating": 0, "comment": "test"}'

# 잘못된 평점 (6점)
curl -X POST "http://localhost:8080/api/events/1/reviews" \
  -H "X-User-Id: 1" -H "Content-Type: application/json" \
  -d '{"rating": 6, "comment": "test"}'

# 댓글 누락
curl -X POST "http://localhost:8080/api/events/1/reviews" \
  -H "X-User-Id: 1" -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

#### 404 Not Found (없는 이벤트)
```bash
# 존재하지 않는 이벤트 ID
curl "http://localhost:8080/api/events/999/reviews" -H "X-User-Id: 1"
```

#### 시드 토글 (데이터 초기화)
```properties
# application-local.properties에서 설정
app.seed.always=true  # 기존 데이터 삭제 후 재생성
app.seed.reviews=true # 리뷰 더미 데이터 생성
```

### Swagger UI 확인
- **접속**: `http://localhost:8080/swagger-ui/index.html`
- **Reviews 그룹**에서 다음 API 확인:
  - `GET /api/events/{id}/reviews` - 리뷰 목록 조회
  - `POST /api/events/{id}/reviews` - 리뷰 작성
- **예시 값**과 **에러 응답 스키마** 확인

### TODO (추후 구현)
- [ ] 리뷰 신고 기능 (부적절한 리뷰 신고)
- [ ] 리뷰 삭제 기능 (작성자/관리자 권한)
- [ ] 스팸 방지 (동일 사용자 중복 작성 제한)
- [ ] 리뷰 수정 기능
- [ ] 리뷰 필터링 (평점별, 날짜별)

### TODO
- 이벤트 상세/찜/참가 API 연동 항목을 본 가이드에 추가(테스트 시나리오 확장)
- 배포 전 DEV 전용 헤더 인터셉터 제거 및 실제 인증 연동