# 진행 상황 (Progress)

_이 문서는 작동 중인 기능, 구축해야 할 기능, 현재 상태, 알려진 문제 및 프로젝트 결정의 진화를 추적합니다._

## 현재 작동 중인 기능

- **기본 라우팅:** 타이틀, 스토리, 댓글, 결과 화면 간의 기본적인 화면 전환 (`react-router-dom`).
- **기본 레이아웃:** 전체 게임 화면을 감싸는 `GameViewport` 컴포넌트 존재.
- **주요 씬 컴포넌트 구조:** `TitleScreen`, `StoryScene`, `CommentScene`, `ResultScene` 등 주요 화면 컴포넌트 파일 생성됨.
- **UI 컴포넌트:** `shadcn/ui` 기반의 기본 UI 요소들 (`Button`, `Card` 등) 및 커스텀 UI 컴포넌트 (`DialogueBox`, `Character` 등) 일부 존재.
- **상태 관리 훅:** 게임 상태, 스토리 진행, 댓글 상태 등을 관리하기 위한 Custom Hooks (`useGameState`, `useStoryProgression`, `useCommentState` 등) 구조 존재.
- **데이터 로딩 훅:** JSON 파일로부터 스크립트, 미션 데이터를 로드하기 위한 훅 (`useScriptLoader`, `useMissionData`) 구조 존재.
- **AI 댓글 생성 백엔드:** Google Gemini API를 사용하는 서버리스 함수 (`api/generate-comments.ts`) 및 서비스 (`src/services/geminiService.ts`) 존재.
- **오디오 관리자:** 오디오 재생을 위한 `audioManager.ts` 존재.

## 구축해야 할 기능

- **스토리 콘텐츠 로딩 및 표시:** `StoryScene` 내에서 스크립트 데이터를 실제로 로드하고 대화, 캐릭터, 배경 등을 표시하는 기능 구현.
- **선택지 시스템 구현:** `Choices` 컴포넌트와 `useStoryProgression` 훅을 연동하여 사용자 선택 처리 및 분기 로직 구현.
- **댓글 시스템 완성:** `CommentScene`에서 AI 댓글을 실제로 요청하고 표시하며, 사용자 댓글 입력 및 상태 관리(`useCommentState`, `useGeminiComments`) 기능 완성.
- **미션 시스템 연동:** `MissionPanel` 컴포넌트 표시 및 `useMissionStatus` 훅을 통한 미션 상태 추적 및 업데이트 로직 구현.
- **결과 화면 로직:** `ResultScene`에서 게임 결과 또는 에피소드 완료 상태를 표시하는 로직 구현.
- **설정 메뉴 기능:** `SettingsMenu` 컴포넌트와 `SettingsContext`를 연동하여 실제 설정(볼륨 조절 등) 기능 구현.
- **오디오 시스템 통합:** `audioManager`를 각 씬 및 이벤트에 맞게 연동하여 배경음악, 효과음 재생 구현.
- **상태 관리 구체화:** `useGameState` 등 전역 상태 관리 훅의 세부 로직 구현 및 컴포넌트 연동.
- **오류 처리 및 예외 관리:** API 호출 실패, 데이터 로딩 실패 등 다양한 오류 상황에 대한 처리 로직 추가.
- **UI/UX 개선:** 전반적인 사용자 인터페이스 디자인 및 사용자 경험 개선 작업.

## 현재 상태

- 프로젝트 초기 개발 단계.
- 기본적인 애플리케이션 구조와 라우팅, 주요 컴포넌트 및 훅의 뼈대는 잡혀 있으나, 핵심 기능들의 구체적인 로직 구현이 필요한 상태.
- AI 댓글 생성 기능의 백엔드 부분은 준비되었으나 프론트엔드 연동 및 완성 필요.

## 알려진 문제

- 현재 코드 분석 단계에서는 구체적인 버그는 파악되지 않았으나, 기능 구현 과정에서 발생할 수 있음.
- `list_code_definition_names` 도구가 제한적인 정보만 제공하여 전체 구조 파악에 어려움이 있었음.

## 결정 진화

- (아직 기록된 주요 결정 변경 사항 없음)
