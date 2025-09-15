# Dev Branch README

> 이 문서는 **병합용(dev) 브랜치 전용 가이드**입니다. `dev`는 각 기능 브랜치(feature/\*)에서 머지되는 **통합/검증용 브랜치**이며, `main`(또는 `prod`)에 배포되기 전 최종 품질을 확보하는 공간입니다.

---

##  목적

* 팀원들이 동일한 규칙으로 작업·커밋·머지하도록 표준을 제공합니다.
* 로컬/도커 실행법, 브랜치 전략, MR 규칙, 커밋 컨벤션, 리뷰 체크리스트를 한곳에서 확인할 수 있습니다.

---

### 필수 요구사항

* **Java 21**
* **Node.js ≥ 20.19** (Vite 요구사항)
* **npm** 또는 **pnpm**




## 유용한 Git 명령어

```bash
# dev 브랜치 생성/전환
git fetch origin
git checkout -b dev origin/dev || git checkout -b dev

# README 작성 후 커밋/푸시
git add README.md
git commit -m "docs(readme): add dev-branch guidelines"
git push -u origin dev

# feature 브랜치 생성
git checkout -b feature/123-chat-websocket dev

# 최신 dev 반영 (rebase)
git fetch origin
git rebase origin/dev

# MR 생성은 GitLab UI에서 수행 (타깃: dev)
```

---


---

### 문서 변경 방법

* 본 문서는 `dev` 브랜치 기준입니다. 내용 업데이트 시 `docs(readme): ...` 형태로 커밋하고 MR을 생성하세요.
