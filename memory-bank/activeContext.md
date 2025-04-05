# 활성 컨텍스트 (Active Context)

_이 문서는 현재 작업 초점, 최근 변경 사항, 다음 단계, 활성 결정 및 고려 사항, 중요한 패턴 및 선호도, 학습 및 프로젝트 통찰력을 추적합니다._

## 현재 초점

- **핵심 게임플레이 루프 구현:** 스토리 진행(`StoryScene`), 댓글 상호작용(`CommentScene`), 미션 시스템 연동의 기본적인 기능 구현에 집중합니다.
- **데이터 연동:** `public/` 폴더의 JSON 데이터(스크립트, 미션 등)를 실제 컴포넌트에 로드하고 표시하는 작업을 우선적으로 진행합니다.
- **AI 연동:** `CommentScene`에서 Google Gemini API를 호출하여 댓글을 생성하고 표시하는 기능 구현.

## 최근 변경 사항

- 타이틀 화면(`src/components/TitleScreen.tsx`)의 타이틀 이미지(`public/title.png`) 크기를 키웠습니다 (h-24 -> h-48).
- 타이틀 화면(`src/components/TitleScreen.tsx`)의 텍스트 제목을 `public/title.png` 이미지 로고로 교체했습니다.
- **Memory Bank 업데이트:** 코드베이스 분석을 통해 `projectbrief.md`, `techContext.md`, `systemPatterns.md`, `progress.md`, `activeContext.md` 파일 업데이트 완료. (`productContext.md`는 사용자 요청으로 템플릿 유지)
- **Electron 빌드 디버깅:**
  - `package.json`에 누락된 `description`, `author` 필드 추가.
  - `package.json`의 `build` 설정에서 `asar` 활성화.
  - `public/electron.ts`에서 `index.html` 로드 경로를 `app.getAppPath()` 사용하도록 수정.
  - `src/index.tsx`에서 `BrowserRouter`를 `HashRouter`로 변경.
  - `src/components/TitleScreen.tsx`에서 이미지 경로를 상대 경로로 수정.
  - `src/hooks/useEpisodeLoader.ts`에서 `script.json` 로드 경로를 상대 경로로 수정.
- **다국어 지원 시스템 구현:**
  - `i18next`, `react-i18next` 라이브러리 설치 및 설정 (`src/i18n.ts`, `src/index.tsx`).
  - `public/locales/{ko,en,zh}` 디렉토리 및 리소스 파일 생성.
  - `TitleScreen`, `CommentInput`, `SettingsMenu` 컴포넌트 국제화 적용 및 네임스페이스 접두사 사용하도록 수정.
  - `useScriptLoader`, `useMissionData` 훅에서 번역 로직 제거 (원본 데이터 반환).
  - `SettingsMenu`에 언어 선택 드롭다운 UI 구현.
  - 메모리 뱅크 파일 업데이트 (`systemPatterns.md`, `techContext.md`, `progress.md`).
- **LLM 댓글 생성 시 언어 지정:**
  - `useGeminiComments` 훅에서 현재 언어 정보를 가져와 `generateAiComments` 서비스 함수 호출 시 전달하도록 수정.
  - `geminiService.ts`의 `generateAiComments` 함수가 언어 인수를 받도록 수정.
  - `api/generate-comments.ts` 서버리스 함수가 요청 본문에서 언어 정보를 받도록 수정.
  - `promptGenerator.ts`의 `generateCommentPrompt` 및 `generateFeedbackPrompt` 함수가 언어 인수를 받고, 프롬프트의 언어 지침을 강화하고 한국어 외 언어 요청 시 관련 지침을 조정하도록 수정.
  - 관련 메모리 뱅크 파일 업데이트 (`systemPatterns.md`, `techContext.md`, `progress.md`).

## 다음 단계

1.  **스토리 콘텐츠 표시:** `StoryScene`에서 `useScriptLoader` 등을 사용하여 스크립트 데이터를 로드하고, `DialogueBox`, `Character` 컴포넌트를 통해 대사, 캐릭터 이미지 등을 표시합니다.
2.  **선택지 기능 구현:** `Choices` 컴포넌트 표시 및 사용자 선택 시 `useStoryProgression` 훅을 통해 다음 스토리 ID를 업데이트하는 로직을 구현합니다.
3.  **AI 댓글 생성 연동:** `CommentScene`에서 `useGeminiComments` 훅 또는 직접 `geminiService`를 사용하여 AI 댓글 생성 API를 호출하고, 결과를 `CommentList`에 표시합니다.
4.  **사용자 댓글 입력:** `CommentInput` 컴포넌트 기능 구현 및 `useCommentState` 연동.
5.  **미션 패널 표시:** `MissionPanel` 컴포넌트를 적절한 시점에 표시하고 `useMissionData`, `useMissionStatus` 훅과 연동합니다.
6.  **오디오 통합:** 주요 씬 전환 및 이벤트 발생 시 `audioManager`를 사용하여 배경음악 및 효과음을 재생합니다.

## 활성 결정 및 고려 사항

- **상태 관리 세부 구현:** 각 Custom Hook (`useGameState`, `useStoryProgression` 등)의 구체적인 상태 구조와 업데이트 로직 정의 필요.
- **오류 처리 전략:** API 호출 실패, 데이터 로딩 실패 시 사용자에게 어떻게 피드백을 줄 것인지 결정 필요.
- **UI/UX 세부 디자인:** 각 씬과 컴포넌트의 구체적인 디자인 및 사용자 인터랙션 방식 확정 필요.
- **Gemini API 프롬프트 최적화:** AI 댓글 생성 시 원하는 결과(톤, 내용 등)를 얻기 위한 프롬프트 엔지니어링 필요.
- **Electron 빌드 환경:** 개발 환경(`npm start`)과 빌드된 Electron 앱(`file://` 프로토콜) 간의 경로 처리 방식 차이 주의. 정적 파일(이미지, JSON 등) 로드 시 상대 경로 또는 `HashRouter` 사용 고려.

## 중요한 패턴 및 선호도

- **React Hooks:** 상태 및 로직 관리를 위해 Custom Hooks를 적극적으로 활용합니다 (`useGameState`, `useStoryProgression`, `useCommentState` 등).
- **Context API:** 전역 설정(`SettingsContext`) 관리에 사용됩니다.
- **Tailwind CSS & shadcn/ui:** UI 개발의 주요 도구로 사용됩니다. 유틸리티 우선 접근 방식과 사전 빌드된 컴포넌트를 활용합니다.
- **TypeScript:** 정적 타입을 통해 코드 안정성을 확보합니다.
- **JSON 기반 데이터:** 게임 스크립트, 미션 등 주요 데이터는 `public/` 폴더 내 JSON 파일로 관리됩니다.
- **Vercel Serverless Functions:** 간단한 백엔드 API (AI 프록시 등) 구현에 사용됩니다.

## 학습 및 통찰력

- `list_code_definition_names` 도구는 중첩된 디렉토리 구조의 전체적인 파악에는 제한적이므로, 주요 진입점 파일(`App.tsx`)이나 특정 컴포넌트 파일을 직접 읽어 구조를 파악하는 것이 더 효과적이었습니다.
- 프로젝트는 인터랙티브 내러티브와 AI 기반 댓글 시스템을 결합한 독특한 컨셉을 가지고 있으며, 각 시스템의 유기적인 연동이 중요합니다.
- 초기 구조는 잘 잡혀 있으나, 실제 게임 로직 구현에 많은 작업이 필요합니다.
- Electron 빌드 시 `file://` 프로토콜 환경에서 발생하는 경로 문제 해결 경험. (절대 경로 -> 상대 경로, BrowserRouter -> HashRouter)
  - `webSecurity: false` 설정은 로컬 파일 로드 오류 해결에 도움이 될 수 있으나, 보안상 권장되지 않음. (현재는 이 설정 없이도 로드 성공)
- 다국어 지원 구현 시, 원본 텍스트를 번역 키로 사용하는 방식은 리소스 파일 관리를 용이하게 하지만, 텍스트 내용 변경 시 모든 언어의 키를 수정해야 하는 단점이 있음. (현재 이 방식 유지)
- `i18next-http-backend`를 사용하여 번역 파일을 비동기적으로 로드하므로 초기 로딩 시 약간의 지연이 발생할 수 있음 (`React.Suspense`로 처리).
- LLM 프롬프트에 언어 지정 지침을 추가하고 강화했지만, LLM의 특성상 다른 프롬프트 요소(예: 한국어 예시)의 영향을 받아 100% 정확하게 해당 언어로만 생성된다고 보장하기는 어려울 수 있음.
- 컴파일 오류(TS2554) 해결: 데이터 로딩 훅에서 번역 로직을 제거하고, 컴포넌트에서 `t` 함수 호출 시 네임스페이스 접두사(`namespace:key`)를 사용하도록 수정했으나, 이후 재수정 과정에서 다시 문제가 발생하여 여러 번의 시도 끝에 해결함.
