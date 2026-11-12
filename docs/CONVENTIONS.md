# 🤝 RunNyAng 협업 및 컨벤션 가이드

본 문서는 **RunNyAng** 프로젝트에 참여하는 기획자, 개발자, 디자이너, 백엔드 개발자 간의 원활한 소통과 효율적인 협업을 위한 규칙입니다.

---

## 👥 1. 역할 정의 (Roles & Responsibilities)

| 역할 | 담당 업무 및 채널 |
| :--- | :--- |
| **🎮 기획자 (PM)** | • 전체 프로젝트 일정 관리, 마일스톤 수립<br>• GDD(게임 기획서) 작성 및 시스템 밸런싱<br>• Git 레포지토리 관리 및 PR 검토 조율 |
| **💻 프론트엔드 개발자** | • Vite + React + TypeScript 기반 웹앱 게임 클라이언트 구현<br>• Canvas 게임 루프, 물리 연산, 충돌 판정, 반응형 대응<br>• 웹뷰 및 모바일 터치 최적화 |
| **🎨 디자이너** | • 2D 스프라이트(캐릭터/장애물/아이템) 및 배경 패럴랙스 에셋 제작<br>• 인게임 HUD, 타이틀, 결과창 UI/UX 에셋 제공<br>• 반응형 뷰포트에 맞춘 UI 가이드라인 수립 |
| **⚙️ 백엔드 개발자** | • 랭킹/스코어 저장 API, 유저 세션 관리<br>• 데이터베이스 스키마 및 서버 인프라 구축 |

---

## 🌿 2. 브랜치 전략 (Git Branch Strategy)

기본적으로 **GitHub Flow**를 단순화하여 빠른 프로토타이핑에 최적화된 방식을 채택합니다.

```
main (배포 가능한 안정적인 최신 버전)
  │
  ├── develop (개발 메인 브랜치)
  │     ├── feature/game-loop
  │     ├── feature/mobile-touch
  │     ├── design/character-sprite
  │     └── fix/collision-detection
```

### 브랜치 네이밍 규칙
*   `feature/<기능명>` : 새로운 게임 시스템 또는 UI 기능 개발 (예: `feature/jump-mechanic`)
*   `design/<에셋명>` : 그래픽 에셋 추가 및 디자인 UI 스타일 작업 (예: `design/cat-spritesheet`)
*   `fix/<버그명>` : 버그 수정 (예: `fix/slide-hitbox`)
*   `docs/<문서명>` : 기획서, Readme, 가이드라인 수정 (예: `docs/gdd-update`)
*   `chore/<작업명>` : 패키지 의존성, 빌드 설정 등 (예: `chore/vite-setup`)

---

## 💬 3. 커밋 메시지 컨벤션 (Commit Convention)

`타입: 간결하고 명확한 작업 요약` 형태로 작성합니다.

| 타입 | 의미 | 예시 |
| :--- | :--- | :--- |
| **feat** | 새로운 기능 추가 | `feat: 2단 점프 및 체공 물리 로직 구현` |
| **fix** | 버그 수정 | `fix: 모바일 화면에서 터치 스크롤 방지` |
| **design** | UI 스타일, 스프라이트, 에셋 변경 | `design: 고양이 달리기 스프라이트 애니메이션 교체` |
| **refactor** | 기능 변경 없는 코드 구조 개선 | `refactor: 장애물 생성 로직을 팩토리 패턴으로 분리` |
| **docs** | 기획서, README 등 문서 수정 | `docs: 2차 장애물 밸런스 수치 GDD 업데이트` |
| **chore** | 빌드 설정, 의존성 패키지 변경 | `chore: vite 빌드 옵션 최적화` |

---

## 🚀 4. PR (Pull Request) 및 코드 리뷰 규칙

1. 모든 기능 작업은 `develop` 브랜치를 기준으로 분기하고, `develop` 브랜치로 PR을 올립니다.
2. PR 생성 시 제공된 **PR 템플릿**을 성실히 작성합니다.
3. UI나 디자인이 변경된 경우 반드시 **실행 스크린샷 또는 GIF**를 첨부합니다.
4. 기획자 및 담당 동료 최소 1명의 승인(Approve) 후 머지(Squash and merge 권장)합니다.
