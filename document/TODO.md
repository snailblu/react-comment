# TODO 리스트

이 문서는 프로젝트 진행 중 필요한 작업 목록을 관리합니다.

## UI 리팩토링 (픽셀 아트 스타일 직접 구축)

- [ ] **1. shadcn/ui 제거:**
  - `npm uninstall` 명령어를 사용하여 관련 패키지(`@radix-ui/*`, `lucide-react`, `class-variance-authority` 등 shadcn/ui 설치 시 추가된 의존성)를 제거합니다.
  - `components.json` 파일을 삭제합니다.
  - `tailwind.config.js`에서 shadcn/ui 관련 설정을 제거합니다.
  - `src/lib/utils.ts` 파일의 `cn` 함수 등 shadcn/ui 관련 유틸리티 함수를 제거하거나 수정합니다.
  - `src/components/ui/` 디렉토리를 삭제합니다.
- [ ] **2. 픽셀 아트 스타일 설정:**
  - [ ] 픽셀 아트 폰트 선정 및 프로젝트에 추가 (`public/fonts` 또는 `src/assets/fonts`).
  - [ ] `tailwind.config.js`에 픽셀 폰트 패밀리 정의.
  - [ ] `tailwind.config.js`에 픽셀 아트 색상 팔레트 정의.
  - [ ] 전역 CSS (`src/index.css`)에 픽셀 아트 관련 기본 스타일(예: `image-rendering: pixelated;`, 폰트 앤티앨리어싱 비활성화 등) 추가.
- [ ] **3. 커스텀 픽셀 아트 컴포넌트 디렉토리 생성:**
  - `src/components/pixel/` (또는 유사한 이름) 디렉토리를 생성합니다.
- [ ] **4. 기본 픽셀 아트 컴포넌트 구현:**
  - [ ] `PixelButton.tsx` 구현 (기본 버튼 스타일, 상태별 스타일).
  - [ ] `PixelCard.tsx` 또는 `PixelWindow.tsx` 구현 (컨테이너, 테두리 스타일).
  - [ ] `PixelInput.tsx` 구현 (입력 필드 스타일).
  - [ ] `PixelDialog.tsx` 구현 (모달 창 스타일).
  - [ ] (필요에 따라 추가 컴포넌트 구현)
- [ ] **5. 기존 컴포넌트에서 shadcn/ui 사용 부분 교체:**
  - [ ] 프로젝트 전체 코드에서 기존 `src/components/ui/` 컴포넌트를 사용하던 부분을 검색합니다.
  - [ ] 해당 부분을 새로 만든 커스텀 픽셀 아트 컴포넌트(예: `PixelButton`)로 교체합니다.
- [ ] **6. 스타일 검토 및 조정:**
  - [ ] 애플리케이션을 실행하여 모든 UI 요소가 의도한 픽셀 아트 스타일로 표시되는지 확인합니다.
  - [ ] 필요한 경우 Tailwind 클래스 또는 커스텀 CSS를 수정하여 스타일을 조정합니다.

## 상태 관리 리팩토링 (Zustand 기반) - 완료

- [x] **1. Zustand 라이브러리 설치:**
  - `npm install zustand` 명령어를 실행하여 프로젝트에 Zustand를 추가합니다.
- [x] **2. 스토어 디렉토리 생성:**
  - `src/stores` 디렉토리를 생성하여 Zustand 스토어 파일들을 관리합니다.
- [x] **3. 도메인별 스토어 파일 생성 및 기본 구조 설정:**
  - [x] `src/stores/gameStateStore.ts` 생성 (현재 씬, 로딩 상태 등 관리)
  - [x] `src/stores/storyStore.ts` 생성 (현재 스토리 ID, 스크립트 데이터 등 관리)
  - [x] `src/stores/commentStore.ts` 생성 (댓글 목록, 여론 점수 등 관리)
  - [x] `src/stores/missionStore.ts` 생성 (미션 데이터, 진행 상태 등 관리)
  - [x] `src/stores/settingsStore.ts` 생성 (오디오 볼륨, 언어 등 설정 관리 - 기존 `SettingsContext` 대체)
  - 각 파일에 Zustand `create` 함수를 사용하여 기본 스토어 구조(상태, 액션)를 정의합니다.
- [x] **4. 상태 및 액션 정의 (스토어별):**
  - [x] `gameStateStore`: 필요한 상태(예: `currentScene`, `isLoading`)와 관련 액션(예: `setCurrentScene`, `setLoading`) 정의.
  - [x] `storyStore`: 필요한 상태(예: `currentStoryId`, `scriptData`)와 관련 액션(예: `setScriptData`, `advanceStory`) 정의.
  - [x] `commentStore`: 필요한 상태(예: `comments`, `opinionScore`)와 관련 액션(예: `addComment`, `updateOpinionScore`) 정의.
  - [x] `missionStore`: 필요한 상태(예: `currentMission`, `isCompleted`)와 관련 액션(예: `setMission`, `completeMission`) 정의.
  - [x] `settingsStore`: 필요한 상태(예: `volume`, `language`)와 관련 액션(예: `setVolume`, `setLanguage`) 정의.
- [x] **5. 기존 상태 관리 로직 이전:**
  - [x] `SettingsContext`의 상태 및 로직을 `settingsStore`로 이전합니다.
  - [x] `useGameState`, `useStoryProgression`, `useCommentState`, `useMissionStatus` 등 기존 Custom Hooks에서 상태 관리 부분을 식별하고 해당 로직을 각 도메인별 Zustand 스토어의 액션으로 이전합니다.
- [x] **6. 컴포넌트 수정:**
  - [x] 기존에 Context API 또는 Custom Hooks를 통해 상태를 사용하던 컴포넌트들을 찾습니다.
  - [x] 해당 컴포넌트에서 Zustand 스토어 훅(예: `const currentScene = useGameState(state => state.currentScene);`)을 사용하여 상태를 구독하도록 수정합니다.
  - [x] 상태 업데이트가 필요한 부분에서는 스토어의 액션 함수(예: `useGameState.getState().setCurrentScene('newScene');`)를 호출하도록 수정합니다.
- [x] **7. Custom Hooks 재정의/정리:**
  - [x] 상태 관리 로직이 Zustand 스토어로 이전된 후, 기존 Custom Hooks의 역할을 재검토합니다.
  - [x] 비동기 로직(데이터 로딩, API 호출)이나 순수 UI 로직만 남은 Hooks는 유지하거나, 필요시 Zustand 스토어와 상호작용하도록 수정합니다. (예: `useGeminiComments` 훅이 비동기 호출 후 `commentStore`의 액션을 호출하여 상태 업데이트)
  - [x] 더 이상 필요 없어진 Custom Hooks는 제거합니다.
- [x] **8. 테스트 코드 업데이트 (필요시):**
  - [x] 상태 관리 변경으로 인해 영향을 받는 기존 테스트 코드를 수정합니다.
  - [x] Zustand 스토어를 사용하는 컴포넌트 또는 훅에 대한 새로운 테스트 코드를 작성합니다.
- [x] **9. 코드 정리 및 최종 확인:**
  - [x] 리팩토링 과정에서 발생한 불필요한 코드(주석 처리된 코드, 사용되지 않는 import 등)를 제거합니다.
  - [x] 애플리케이션을 실행하여 상태 관리가 정상적으로 작동하는지 전체적으로 확인합니다.

---

_(추후 다른 작업 항목 추가 가능)_
