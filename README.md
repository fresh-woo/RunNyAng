# 🐾 RunNyAng (런냥)

> **귀여운 고양이와 함께 달리는 2D 캐주얼 런닝 웹앱 게임**  
> 빠른 속도감과 리드미컬한 조작감을 웹 브라우저와 모바일 웹뷰(앱) 어디서든 부드럽게 즐길 수 있는 반응형 웹 게임 프로젝트입니다.

---

## 📌 목차 (Table of Contents)
1. [프로젝트 소개](#-프로젝트-소개)
2. [기술 스택](#-기술-스택)
3. [빠른 시작 가이드](#-빠른-시작-가이드)
4. [프로젝트 디렉토리 구조](#-프로젝트-디렉토리-구조)
5. [협업 가이드 및 컨벤션](#-협업-가이드-및-컨벤션)
6. [팀 구성 및 역할](#-팀-구성-및-역할)
7. [마일스톤 및 로드맵](#-마일스톤-및-로드맵)

---

## 🎮 프로젝트 소개

* **장르**: 2D 사이드스크롤 엔들리스 런너 (2D Endless Runner)
* **플랫폼**: 반응형 웹 (PC / Mobile / Tablet / App WebView 호환)
* **게임 목표**: 다가오는 장애물을 점프와 슬라이딩으로 피하며 최대한 멀리 달리고 코인을 수집하여 최고 기록을 경신합니다.
* **핵심 특징**:
  * 📱 **반응형 웹앱 설계**: 모바일 뷰포트(`user-scalable=no`, 풀스크린) 최적화 및 터치 인터랙션 지원
  * ⚡ **초경량 & 고성능**: Vite + Canvas API를 활용한 가벼운 번들 및 끊김 없는 프레임 유지
  * 🎯 **2단 점프 & 슬라이딩 시스템**: 다양한 패턴의 지상/공중 장애물 공략 재미 제공

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
* **Core**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vite.dev/)
* **Rendering**: HTML5 Canvas 2D Context
* **Package Manager**: npm

### Backend & Database (예정)
* 동료 개발자 담당 (유저 인증 및 글로벌 랭킹 시스템 연동 예정)

---

## 🚀 빠른 시작 가이드 (Getting Started)

### 1. 레포지토리 클론
```bash
git clone https://github.com/fresh-woo/RunNyAng.git
cd RunNyAng
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
기본적으로 브라우저에서 `http://localhost:3000`으로 접속하여 게임을 플레이할 수 있습니다.

### 4. 프로덕션 빌드
```bash
npm run build
```

---

## 📁 프로젝트 디렉토리 구조 (Light FSD Architecture)

유지보수, 테스트 및 컴포넌트 재사용성을 극대화하기 위해 **Light FSD (Feature-Sliced Design)** 구조를 채택했습니다.

```
RunNyAng/
├── .github/                       # GitHub 이슈 및 PR 템플릿
├── docs/                          # 기획서(GDD) 및 팀 협업 컨벤션
├── public/                        # 정적 파일 (파비콘, 기본 사운드 에셋)
├── src/
│   ├── app/                       # 1. 앱 진입점 및 전역 스타일
│   │   ├── styles/index.css       # 모바일 웹앱 터치/스크롤 방지 글로벌 CSS
│   │   └── App.tsx                # 최상위 앱 레이아웃
│   ├── pages/                     # 2. 페이지 단위 화면 조합
│   │   └── game-page/             # 메인 인게임 페이지 (HUD, Canvas, Modal 조립)
│   ├── widgets/                   # 3. 독립적이고 완성도 높은 복합 UI 블록
│   │   ├── game-canvas/           # 캔버스 뷰포트 위젯
│   │   ├── hud/                   # 거리, 코인, 최고기록, 일시정지 버튼 표시 HUD
│   │   ├── ready-overlay/         # 게임 시작 전 타이틀 오버레이
│   │   ├── pause-overlay/         # 게임 일시정지 및 재개 오버레이
│   │   └── game-over-modal/       # 게임 오버 결과 모달
│   ├── features/                  # 4. 사용자 인터랙션 & 게임 구동 로직
│   │   ├── controls/              # 키보드 / 모바일 터치 조작 훅 (useGameControls)
│   │   └── game-engine/           # 게임 루프 & 런타임 상태 관리 훅 (useGameEngine)
│   ├── entities/                  # 5. 핵심 게임 도메인 모델 (물리, 충돌, 렌더링)
│   │   ├── player/                # 플레이어 모델, 점프/슬라이딩 물리, 렌더러
│   │   ├── obstacle/              # 장애물 모델, 스폰 및 AABB 충돌 로직, 렌더러
│   │   └── coin/                  # 코인 모델, 스폰 및 수집 충돌 판정, 렌더러
│   ├── shared/                    # 6. 공통 유틸, 상수 및 기본 UI 컴포넌트
│   │   ├── config/                # 게임 물리/속도/캔버스 설정 상수 (gameConfig.ts)
│   │   ├── types/                 # 공통 상태 및 스코어 인터페이스
│   │   └── ui/                    # Button, Overlay 등 원자 단위 공통 UI
│   ├── main.tsx                   # 애플리케이션 마운트 엔트리
│   └── vite-env.d.ts
├── index.html                     # 뷰포트 메타태그 및 반응형 웹앱 설정
├── package.json
└── vite.config.ts
```

---

## 🤝 협업 가이드 및 컨벤션

원활한 협업을 위해 브랜치 전략, 커밋 메시지 규칙, PR 템플릿을 준수합니다.  
👉 **자세한 내용은 [docs/CONVENTIONS.md](docs/CONVENTIONS.md) 문서를 참고해주세요.**

* **브랜치 전략**: `main` (배포) ➔ `develop` (통합 개발) ➔ `feature/*`, `design/*`, `fix/*`
* **커밋 규칙**: `feat:`, `fix:`, `design:`, `refactor:`, `docs:`, `chore:` 접두사 사용

---

## 👥 팀 구성 및 역할

| 역할 | 채널/담당 | 주요 업무 |
| :--- | :--- | :--- |
| **🎮 기획자 (PM)** | 기획 채팅 (본 대화창) | 프로젝트 일정 조율, GDD 기획, 기능 명세 및 브랜치/PR 관리 |
| **💻 개발자 (Frontend)** | 개발 채팅 | React + TypeScript Canvas 게임 엔진 및 모바일 웹앱 반응형 구현 |
| **🎨 디자이너** | 디자인 채팅 | 고양이 캐릭터 스프라이트, 장애물/코인 그래픽, UI/UX 에셋 제작 |
| **⚙️ 개발자 (Backend)** | 백엔드 협업 | 스코어 저장, 리더보드/랭킹 API 연동 |

---

## 🗺️ 마일스톤 및 로드맵

- [x] **Phase 1: 프로젝트 환경 셋업 & 협업 가이드라인 정립**
  - Vite + React + TS 기반 프로젝트 스캐폴딩
  - Git 컨벤션, PR/Issue 템플릿, README 및 GDD 작성
  - 플레이 가능한 기본 2D 런너 프로토타입 캔버스 구현
- [ ] **Phase 2: 그래픽 & 사운드 리소스 통합**
  - 디자이너 스프라이트 시트 및 애니메이션 프레임워크 연동
  - 배경 다중 레이어 패럴랙스 스크롤링 구현
  - BGM 및 점프/슬라이딩/충돌 SFX 오디오 시스템 추가
- [ ] **Phase 3: 게임 밸런싱 & 모바일 반응형 UX 고도화**
  - 속도 가속도 및 장애물 등장 빈도 밸런싱
  - 모바일 제스처 터치(스와이프 슬라이딩) 감도 튜닝
- [ ] **Phase 4: 백엔드 랭킹 연동 & 배포**
  - 글로벌 리더보드 API 연동
  - 프로덕션 배포 (Vercel / Netlify 등)
