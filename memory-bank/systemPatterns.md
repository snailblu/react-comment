# 시스템 패턴 (System Patterns)

_이 문서는 시스템 아키텍처, 주요 기술 결정, 사용 중인 디자인 패턴, 구성 요소 관계 및 중요한 구현 경로를 설명합니다._

## 시스템 아키텍처

- **아키텍처:** React 기반 싱글 페이지 애플리케이션 (SPA)
- **라우팅:** 클라이언트 사이드 라우팅 (`react-router-dom` 사용)
- **주요 구성 요소:**
  - `App.tsx`: 애플리케이션 진입점 및 라우팅 설정
  - `GameViewport.tsx`: 전체 게임 화면 레이아웃 컨테이너
  - `TitleScreen.tsx`: 시작 화면 컴포넌트 (루트 경로 `/`)
  - `StoryScene.tsx`: 메인 스토리 진행 컴포넌트 (경로 `/game`)
  - `CommentScene.tsx`: 댓글 인터페이스 컴포넌트 (경로 `/comment/:missionId`)
  - `ResultScene.tsx`: 결과 표시 컴포넌트 (경로 `/result`)
- **데이터 흐름:**
  - 라우터가 URL 경로에 따라 해당 씬(Scene) 컴포넌트를 렌더링합니다.
  - 컴포넌트 간 상태 전달은 props 또는 Context API/Custom Hooks를 통해 이루어질 것으로 예상됩니다 (세부 구현 확인 필요).
  - 외부 데이터(스크립트, 미션 등)는 `public/` 폴더의 JSON 파일에서 로드될 가능성이 높습니다 (`useScriptLoader`, `useMissionData` 훅 참조).
  - AI 기반 댓글 생성은 `api/generate-comments.ts` (Vercel Serverless Function) 및 `src/services/geminiService.ts`를 통해 Google Gemini API와 통신하여 처리됩니다.

## 주요 기술 결정

- **프론트엔드 프레임워크:** React (CRA 기반) - 컴포넌트 기반 UI 개발 및 풍부한 생태계 활용.
- **라우팅:** `react-router-dom` - React 애플리케이션의 표준 라우팅 라이브러리.
- **스타일링:** Tailwind CSS - 유틸리티 우선 CSS 프레임워크로 빠른 UI 개발 지원. CSS Modules도 일부 사용.
- **UI 컴포넌트:** shadcn/ui (Radix UI + Tailwind CSS) - 재사용 가능하고 접근성 높은 UI 컴포넌트 라이브러리.
- **상태 관리:** React Context API 및 Custom Hooks, Zustand (`settingsStore`) - 전역 상태 및 로직 재사용.
- **비동기 통신:** Fetch API 또는 Axios (Gemini 서비스 확인 필요) - API 호출.
- **AI:** Google Gemini - 댓글 생성 등 AI 기능 구현.
- **국제화(i18n):** i18next, react-i18next - 다국어 지원 (한국어, 영어, 중국어).
- **오디오:** Howler.js - 웹 오디오 관리.
- **백엔드:** Vercel Serverless Functions - 간단한 백엔드 로직(API 프록시 등) 구현.

## 디자인 패턴

- **컴포넌트 기반 아키텍처:** UI를 재사용 가능한 컴포넌트로 분할.
- **컨테이너/프레젠테이션 패턴:** `GameViewport`와 같은 레이아웃 컴포넌트와 `TitleScreen`, `StoryScene` 등 특정 뷰를 담당하는 컴포넌트 분리.
- **훅 (Hooks):** 상태 로직 및 부수 효과를 컴포넌트로부터 분리하고 재사용 (`useState`, `useEffect`, Custom Hooks).
- **Context API:** 전역 상태 (예: 설정) 관리 (`SettingsContext.tsx`).
- **모듈 패턴:** CSS Modules를 사용하여 컴포넌트 스타일 스코프 지정.

## 구성 요소 관계

- `App`은 `GameViewport` 내에서 `Routes`를 정의하고, 각 `Route`는 특정 씬 컴포넌트 (`TitleScreen`, `StoryScene`, `CommentScene`, `ResultScene`)를 렌더링합니다.
- `GameViewport`는 모든 씬의 공통 레이아웃을 제공합니다.
- 각 씬 컴포넌트는 내부적으로 더 작은 UI 컴포넌트들 (`DialogueBox`, `Character`, `Choices`, `CommentInput`, `CommentList` 등)을 조합하여 구성됩니다.
- Custom Hooks (`useGameState`, `useStoryProgression`, `useCommentState` 등)는 특정 기능 관련 상태와 로직을 캡슐화하여 여러 컴포넌트에서 사용될 수 있습니다.
- `geminiService.ts`는 Google Gemini API와의 통신을 담당하고, `useGeminiComments` 훅이나 `CommentScene` 등에서 사용될 수 있습니다.
- `api/generate-comments.ts`는 프론트엔드에서 호출하는 서버리스 함수 엔드포인트입니다.

## 중요한 구현 경로

- **스토리 진행 로직:** `useStoryProgression` 훅 및 관련 컴포넌트 (`StoryScene`, `DialogueBox`, `Choices`) - 스크립트 로딩, 상태 업데이트, 사용자 선택 처리.
- **댓글 시스템:** `CommentScene`, `CommentInput`, `CommentList`, `useCommentState`, `useGeminiComments`, `geminiService.ts`, `api/generate-comments.ts` - 사용자 입력 처리, AI 댓글 생성 요청 및 표시.
- **상태 관리:** 게임의 전반적인 상태 (`useGameState`), 미션 상태 (`useMissionStatus`), 설정 (`SettingsContext`, `settingsStore`) 관리 방식.
- **데이터 로딩:** `useScriptLoader`, `useEpisodeLoader`, `useMissionData` - `public/` 폴더의 JSON 파일에서 게임 데이터 비동기 로딩 (번역은 사용하는 컴포넌트에서 처리).

## 게임 시스템

- **LLM 기반 인스타그램 반응/영향력 시뮬레이션 시스템:** (구현 필요)
- **저장/불러오기 시스템:** (구현 필요)
- **언어 변경 시스템:** (i18next, react-i18next 기반 구현 완료)
- **에피소드/미션 관리 시스템:** (JSON 데이터 기반)
