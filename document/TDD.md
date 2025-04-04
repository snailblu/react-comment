# 기술 설계 문서 (TDD): [가제] 인스타라이프 (InstaLife)

---

## 1. 개요

본 문서는 게임 기획서(GDD)에 명시된 "[가제] 인스타라이프 (InstaLife)" 게임의 기술적인 구현 방안을 상세히 기술하는 것을 목표로 합니다. 프로젝트의 아키텍처, 기술 스택, 주요 모듈 설계, 데이터 관리 방식 등을 정의하여 개발의 청사진을 제공합니다.

---

## 2. 시스템 아키텍처

- **기본 구조:** React 기반의 싱글 페이지 애플리케이션 (SPA)으로 개발합니다. Create React App (CRA)를 기반으로 합니다.
- **호스팅:** Vercel 플랫폼을 통해 프론트엔드 및 서버리스 기능을 배포할 가능성이 높습니다.
- **클라이언트:** 웹 브라우저를 통해 사용자가 접근합니다. Electron을 이용한 데스크톱 앱 빌드도 고려되고 있습니다 (`public/electron.ts`, `HashRouter` 사용 등 관련 설정 확인됨).
- **라우팅:** `react-router-dom`을 사용하여 클라이언트 사이드 라우팅을 구현합니다. 주요 경로는 다음과 같습니다:
  - `/`: 타이틀 화면 (`TitleScreen.tsx`)
  - `/game`: 메인 스토리 진행 화면 (`StoryScene.tsx`)
  - `/instagram/:missionId`: 인스타그램 활동 화면 (`InstagramActivityScene.tsx` - 이름 변경 제안)
  - `/result`: 결과 표시 화면 (`ResultScene.tsx`)
- **백엔드:** 핵심 AI 로직 처리를 위해 Vercel Serverless Functions (Node.js)를 사용합니다 (`api/generate-instagram-reactions.ts` - 이름 변경 제안). 이는 Google Gemini API와의 통신을 위한 프록시 역할을 수행합니다.
- **주요 컴포넌트:**
  - `App.tsx`: 애플리케이션 진입점, 라우터 설정.
  - `GameViewport.tsx`: 전체 게임 화면 레이아웃 컨테이너.
  - 각 씬 컴포넌트 (`TitleScreen`, `StoryScene`, `InstagramActivityScene`, `ResultScene`): 특정 게임 상태의 UI 및 로직 담당.
  - UI 요소 컴포넌트 (`DialogueBox`, `Character`, `Choices`, `InstagramFeed`, `InstagramPostInput`, `InstagramCommentList`, `MissionPanel` 등 - 인스타그램 컨셉에 맞춘 컴포넌트 이름 제안): 재사용 가능한 UI 조각.

---

## 3. 기술 스택

- **프로그래밍 언어:** TypeScript
- **프론트엔드:** React (v18+), React Router DOM (v6+)
- **UI/스타일링:** Tailwind CSS, CSS Modules (필요시), Lucide Icons (`clsx`, `tailwind-merge` 유틸리티 사용). 픽셀 아트 스타일 컴포넌트는 Tailwind CSS를 사용하여 직접 구축합니다.
- **상태 관리:** Zustand (주요 상태 관리), React Context API (간단한 전역 설정용, 예: `SettingsContext`)
- **AI:** Google Gemini API (`@google/generative-ai` SDK 사용)
- **오디오:** Howler.js
- **서버리스 백엔드:** Vercel Serverless Functions (Node.js)
- **유틸리티:** `uuid`
- **패키지 관리:** npm
- **빌드 도구:** Create React App (`react-scripts`)
- **테스팅:** Jest, React Testing Library (CRA 기본 설정)
- **버전 관리:** Git

---

## 4. 데이터 관리

- **게임 데이터:** 스토리 스크립트, 미션 정보, 캐릭터 정보 등은 `public/` 폴더 내의 정적 JSON 파일 (`script.json`, `missions.json` 등)로 관리합니다.
- **데이터 로딩:** Custom Hooks (`useScriptLoader`, `useEpisodeLoader`, `useMissionData`)를 사용하여 필요한 시점에 비동기적으로 JSON 데이터를 로드합니다. Electron 빌드 환경을 고려하여 파일 경로는 상대 경로 또는 `app.getAppPath()`를 활용한 동적 경로 설정이 필요할 수 있습니다 (`activeContext.md` 참고).
- **사용자 상태:** 게임 진행 상태(현재 스토리 ID, 미션 상태 등)는 React 상태 및 Custom Hooks를 통해 메모리 내에서 관리됩니다. 영구 저장은 현재 범위에 포함되지 않습니다 (`projectbrief.md`).
- **설정:** 사용자 설정(볼륨 등)은 `SettingsContext`를 통해 관리될 수 있습니다.

---

## 5. 핵심 모듈 및 컴포넌트 설계

- **`App.tsx`:** 라우터 설정 및 전역 컨텍스트 제공자(Provider) 래핑. `HashRouter` 사용 (Electron 호환성).
- **`GameViewport.tsx`:** 모든 게임 씬의 공통적인 레이아웃(배경, 기본 UI 요소 등)을 제공하는 컨테이너 컴포넌트.
- **`TitleScreen.tsx`:** 게임 시작 화면. '시작하기' 버튼 클릭 시 `/game` 경로로 이동. 타이틀 로고 이미지 표시.
- **`StoryScene.tsx`:**
  - `useStoryProgression` 훅을 사용하여 현재 스토리 데이터 관리 및 진행 로직 처리.
  - `useScriptLoader` 등으로 스크립트 데이터 로드.
  - `DialogueBox`, `Character`, `Choices`, `MonologueBox` 등 하위 컴포넌트를 사용하여 스토리 콘텐츠(대사, 캐릭터 이미지, 선택지 등) 표시.
  - 선택지 선택 시 다음 스토리 ID 업데이트 및 상태 전이 처리.
  - 특정 조건 충족 시 `/instagram/:missionId` 또는 `/result` 경로로 이동.
- **`InstagramActivityScene.tsx` (가칭):**
  - `useParams` 훅으로 `missionId` 추출.
  - `useMissionData` 훅으로 해당 미션 정보 로드 및 `MissionPanel`에 표시.
  - `useInstagramState` 훅 (가칭)으로 게시물 목록, 반응(좋아요, 댓글 수, 팔로워), DM 등 관리.
  - `InstagramFeed`, `InstagramCommentList` 컴포넌트로 콘텐츠 및 AI 생성/사용자 작성 댓글/DM 표시.
  - `InstagramPostInput` 컴포넌트로 사용자 콘텐츠 게시(텍스트/이미지 선택) 처리.
  - `useGeminiReactions` 훅 (가칭) 또는 `geminiService`를 직접 사용하여 `api/generate-instagram-reactions.ts` (가칭) 호출, AI 반응(댓글, DM, 좋아요 예측 등) 생성 및 상태 업데이트.
  - `ReactionStats` 컴포넌트 (가칭)로 현재 반응 상태 시각화.
  - 미션 완료 또는 기회 소진 시 `/result` 또는 다음 스토리 씬으로 이동.
- **ResultScene.tsx:** 미션 성공/실패 결과, 클라이언트/팔로워 피드백(LLM 생성 가능, GDD 참고) 등을 표시. 다음 에피소드나 엔딩으로 이동하는 버튼 제공.
- **Custom Hooks & Zustand Stores:**
  - **Zustand Stores:** 게임 상태(`gameStateStore`), 스토리 진행(`storyStore`), 인스타그램 활동 상태(`instagramStore` - 가칭), 미션 상태(`missionStore`), 설정(`settingsStore`) 등 도메인별 스토어를 생성하여 상태와 액션을 관리합니다.
  - **Custom Hooks:** 여전히 유효하며, 주로 비동기 로직(데이터 로딩, API 호출 등)을 캡슐화하거나, 특정 UI 로직을 분리하는 데 사용될 수 있습니다. 필요에 따라 Zustand 스토어와 상호작용합니다. (예: `useGeminiReactions` 훅이 `instagramStore`의 상태를 업데이트).
    - `useScriptLoader`, `useEpisodeLoader`: JSON 데이터 로딩 로직 캡슐화.
- **Services:**
  - `geminiService.ts`: Google Gemini API와의 직접적인 통신 로직 담당. API 키 관리 포함 (`dotenv` 사용). 인스타그램 컨텍스트에 맞는 프롬프트 생성 로직 추가 필요.
  - `audioManager.ts`: Howler.js를 사용하여 오디오 재생/정지/볼륨 조절 등 관리. (필요시 `settingsStore`와 연동)

---

## 6. AI 통합 (Google Gemini)

- **목적:** 게임 내 동적인 AI 반응(댓글, DM) 생성, 콘텐츠 매력도/영향력 평가, 미션 결과에 따른 클라이언트/팔로워 피드백 생성 등 (GDD MoSCoW 분류 참고).
- **구현:**
  - 프론트엔드 (`useGeminiReactions` 또는 `InstagramActivityScene`)에서 필요한 컨텍스트(현재 스토리 상황, 미션 정보, 사용자 게시물 내용 등)를 포함하여 Vercel 서버리스 함수(`api/generate-instagram-reactions.ts` - 가칭)에 요청을 보냅니다.
  - 서버리스 함수는 보안상의 이유로 API 키를 직접 노출하지 않고, 백엔드에서 Google Gemini API (`@google/generative-ai` SDK)를 호출합니다.
  - Gemini API는 주어진 프롬프트를 기반으로 반응 텍스트(댓글, DM), 매력도 점수, 반응 예측 등을 생성하여 응답합니다. (인스타그램 컨텍스트에 맞는 프롬프트 엔지니어링 필요)
  - 서버리스 함수는 Gemini API의 응답을 가공하여 프론트엔드에 전달합니다.
  - 프론트엔드는 응답받은 데이터를 사용하여 댓글/DM 목록 업데이트, 반응 점수 반영 등의 처리를 수행합니다.
- **API 키 관리:** Google Gemini API 키는 환경 변수(`.env` 파일)를 통해 관리하며, 서버리스 함수 환경에 안전하게 주입됩니다.

---

## 7. 상태 관리

- **주요 상태 관리:** Zustand 라이브러리를 사용하여 애플리케이션의 주요 상태를 관리합니다. 도메인별로 스토어(slice)를 분리하여 관리의 용이성과 확장성을 확보합니다.
  - **`gameStateStore`:** 현재 게임 씬, 로딩 상태 등 전반적인 게임 상태 관리.
  - **`storyStore`:** 현재 스토리 ID, 로드된 스크립트 데이터, 진행 관련 상태 관리.
  - **`instagramStore` (가칭):** 게시물 목록, 댓글/DM, 좋아요 수, 팔로워 수, AI 반응 관련 상태 관리.
  - **`missionStore`:** 현재 미션 데이터, 진행 상태, 목표 달성 여부 등 관리.
  - **`settingsStore`:** 오디오 볼륨, 언어 등 사용자 설정 관리.
- **상태 접근 및 업데이트:** 컴포넌트에서는 각 스토어에서 제공하는 훅(예: `useGameState()`)을 사용하여 필요한 상태를 구독(subscribe)하고, 스토어에 정의된 액션(action) 함수를 호출하여 상태를 업데이트합니다.
- **비동기 처리:** Zustand 미들웨어(예: `zustand/middleware`)를 활용하거나, Custom Hook 내에서 비동기 로직(API 호출, 데이터 로딩)을 처리하고 그 결과를 스토어 액션을 통해 업데이트합니다.
- **컴포넌트 로컬 상태:** 여전히 개별 컴포넌트 내에서만 필요한 간단한 UI 상태 등은 `useState` 훅을 사용하여 관리합니다.

---

## 8. UI/UX 구현

- **목표 해상도:** **1280x720**을 기본 디자인 및 개발 기준으로 설정합니다.
- **스타일:** GDD 및 시각 디자인 가이드(`document/visualStyleGuide.md`)에 명시된 대로 **도트(Pixel Art) 스타일**을 기본으로 합니다. Tailwind CSS 유틸리티와 커스텀 CSS (CSS Modules, 필요시)를 조합하여 구현합니다.
- **컴포넌트 구현:** 버튼, 카드, 다이얼로그, 입력 필드 등 필요한 UI 컴포넌트는 시각 디자인 가이드에 따라 Tailwind CSS를 사용하여 픽셀 아트 스타일에 맞게 직접 구축합니다. (예: `src/components/pixel/PixelButton.tsx`)
- **폰트:** 시각 디자인 가이드에 지정된 픽셀 아트 폰트(예: Neo둥근모 Pro)를 적용합니다. (`tailwind.config.js` 및 전역 CSS 설정 필요, 앤티앨리어싱 비활성화 등 가이드 준수)
- **반응형 디자인:** 목표 해상도(1280x720)를 기준으로 하되, 다양한 화면 크기(PC/Mobile 플랫폼 고려)에서도 기본적인 사용성을 유지하도록 반응형 레이아웃을 적용합니다.

---

## 9. 오디오 시스템

- `Howler.js` 라이브러리를 사용하여 배경음악(BGM) 및 효과음(SFX)을 관리합니다.
- `audioManager.ts` 유틸리티를 통해 오디오 로딩, 재생, 정지, 반복, 볼륨 조절 등의 기능을 중앙에서 관리하고, 각 씬이나 컴포넌트에서 이를 호출하여 사용합니다.
- 오디오 파일은 `public/audio/` 디렉토리에 위치합니다.

---

## 10. 빌드 및 배포

- **빌드:** `npm run build` 명령어를 사용하여 프로덕션용 정적 파일을 생성합니다.
- **배포:** Vercel 플랫폼을 활용하여 프론트엔드 정적 파일 및 서버리스 함수를 배포할 가능성이 높습니다. Git 저장소 연동을 통해 자동 배포 설정이 가능합니다.
- **Electron 빌드:** `electron-builder`를 사용하여 데스크톱 애플리케이션으로 빌드합니다. `package.json`의 `build` 설정을 참조하며, `asar` 패키징을 사용합니다.

---

## 11. 오류 처리 및 로깅

- **API 오류:** `geminiService.ts` 및 서버리스 함수에서 API 호출 실패 시 적절한 오류 처리 로직을 구현합니다. 사용자에게 명확한 피드백(예: "댓글 생성 실패")을 제공하는 것을 고려합니다.
- **데이터 로딩 오류:** JSON 파일 로딩 실패 시 대체 콘텐츠 표시 또는 오류 메시지 표시 방안을 마련합니다.
- **로깅:** 개발 중에는 `console.log` 등을 활용하고, 프로덕션 환경에서는 Vercel의 로깅 기능을 활용하거나 별도의 로깅 서비스 도입을 고려할 수 있습니다. (현재 명시적 구현 없음)

---

## 12. 테스팅

- **단위/통합 테스트:** Jest 및 React Testing Library를 사용하여 주요 컴포넌트 및 Custom Hooks의 기능을 테스트합니다. `npm test` 명령어로 실행합니다.
- **E2E 테스트:** 필요시 Cypress 또는 Playwright와 같은 도구를 도입하여 사용자 시나리오 기반의 엔드-투-엔드 테스트를 고려할 수 있습니다. (현재 설정 없음)

---
