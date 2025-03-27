# Opinion Manipulation Game - Implementation Plan

이 문서는 제공된 기획 문서(PRD, App flow, Frontend Guideline, Backend Guideline)와 현재 프로젝트 구조를 기반으로 'Opinion Manipulation Game'의 단계별 구현 계획을 제시합니다.

## Phase 1: 기본 스토리 씬 및 시스템 메뉴 강화

- [ ] **목표:** 현재 구현된 스토리 씬의 기능을 확장하고, 게임 진행에 필수적인 시스템 메뉴(저장, 로드 등)의 기본 구조를 완성합니다.
- [ ] **주요 작업:**
    1.  **`StoryScene` 컴포넌트 개선:** (`src/components/Game.js` 또는 신규 `StoryScene.js` 파일)
        - [ ] `document/App flow.md`에 명시된 전화 디티알톡 채팅 UI 컴포넌트 (`PhoneChat`)를 추가합니다.
        - [ ] 상단 알림 메시지 표시 기능을 구현합니다.
        - [ ] `document/Frontend Guideline.md`의 디자인 가이드라인을 따릅니다.
    2.  **`SystemMenu` 컴포넌트 구현/개선:** (`src/components/SettingsMenu.js` 수정 또는 신규 `SystemMenu.js` 생성)
        - [ ] 저장, 로드, 언어 변경, 타이틀 이동, 종료 버튼 UI를 추가합니다. (초기에는 UI만 구현, 기능은 후속 단계에서 연동)
    3.  **`useGameState` 훅 확장:** (`src/hooks/useGameState.js`)
        - [ ] 현재 에피소드 ID, 씬 진행 상태 등을 관리하는 상태 변수를 추가합니다.
        - [ ] 게임 상태를 저장하고 로드하는 기본 로직을 추가합니다 (실제 데이터 연동은 Phase 4).
    4.  **Supabase 연동 (초기):**
        - [ ] `document/Backend Guideline.md`에 따라 Supabase 프로젝트 설정 및 `episodes` 테이블을 생성합니다.
        - [ ] `StoryScene`에서 `episodes` 테이블로부터 현재 에피소드의 대화 데이터(`intro_dialogues`, `ending_dialogues`)를 불러오는 로직을 `services/supabase.js` (신규 생성 필요) 또는 `hooks/useScriptLoader.js` 개선을 통해 구현합니다.
        - [ ] `saves` 테이블 스키마를 정의합니다.

## Phase 2: 댓글 알바 씬 핵심 기능 구현

- [ ] **목표:** 게임의 핵심 플레이인 댓글 작성 및 여론 조작 기능을 구현합니다.
- [ ] **주요 작업:**
    1.  **Supabase 백엔드 설정:**
        - [ ] `document/Backend Guideline.md`에 따라 `missions`, `opinions`, `comments` 테이블 스키마를 정의하고 생성합니다.
        - [ ] `update-opinion` Edge Function을 생성합니다. (초기에는 댓글 내용 기반 간단한 규칙으로 여론 점수 계산)
        - [ ] `opinions` 테이블에 대한 실시간 구독(Realtime) 기능을 활성화합니다.
    2.  **React 컴포넌트 구현 (`src/components/` 내 신규 파일들):**
        - [ ] `CommentScene`: 댓글 알바 씬의 전체 레이아웃 및 상태 관리를 담당하는 컨테이너 컴포넌트를 구현합니다.
        - [ ] `MissionPanel`: 현재 미션의 목표, 키워드, 조건 등을 표시하는 컴포넌트를 구현합니다 (`missions` 테이블 데이터 연동).
        - [ ] `OpinionStats`: 긍정/부정/중립 여론 비율과 남은 시도 횟수를 표시하는 컴포넌트를 구현합니다 (`opinions` 테이블 데이터 실시간 연동).
        - [ ] `CommentList`: 기존 댓글 및 플레이어가 작성한 댓글 목록을 표시하는 컴포넌트를 구현합니다 (`comments` 테이블 데이터 연동).
        - [ ] `CommentInput`: 플레이어가 댓글을 입력하고 제출하는 UI 및 기능을 구현합니다. 제출 시 `update-opinion` Edge Function을 호출합니다.
        - [ ] `MonologueBox`: 댓글 제출 결과에 따른 주인공 독백을 표시하는 컴포넌트를 구현합니다.
    3.  **`useGameState` 훅 확장:** (`src/hooks/useGameState.js`)
        - [ ] 현재 진행 중인 미션 ID, 남은 댓글 시도 횟수 등을 관리하는 상태를 추가합니다.

## Phase 3: 결과 씬 및 엔딩 처리 구현

- [ ] **목표:** 댓글 알바 미션의 성공/실패 결과를 표시하고, 다양한 엔딩 조건에 따라 게임 흐름을 분기합니다.
- [ ] **주요 작업:**
    1.  **Supabase 백엔드 설정:**
        - [ ] `document/Backend Guideline.md`에 따라 `endings` 테이블 스키마를 정의하고 생성합니다.
        - [ ] `generate-feedback` Edge Function을 생성합니다 (초기에는 고정 텍스트 반환).
        - [ ] `check-ending` Edge Function을 생성하여 플레이어의 진행 상태에 따른 엔딩 조건을 확인하는 로직을 구현합니다.
    2.  **React 컴포넌트 구현 (`src/components/` 내 신규 파일들):**
        - [ ] `ResultScene`: 미션 성공/실패 메시지와 NPC 피드백을 표시하는 컴포넌트를 구현합니다. `generate-feedback` 함수를 호출하여 피드백을 가져옵니다.
        - [ ] `EndingScene`: 엔딩 유형에 따른 메시지를 표시하는 컴포넌트를 구현합니다 (`endings` 테이블 데이터 연동).
    3.  **게임 흐름 제어 로직 수정 (`src/components/Game.js` 또는 `useGameState`):**
        - [ ] `CommentScene`에서 결과에 따라 `EndingScene` (배드 엔딩) 또는 `StoryScene` (에피소드 엔딩)으로 전환하는 로직을 추가합니다.
        - [ ] `ResultScene`에서 다음 에피소드로 넘어가거나, 모든 에피소드 완료 시 `check-ending` 함수를 호출하여 적절한 `EndingScene` (일반/히든 엔딩)으로 전환하는 로직을 구현합니다.

## Phase 4: 타이틀 화면 기능 완성 및 저장/로드 시스템 연동

- [ ] **목표:** 타이틀 화면에서 게임 로드 기능을 완성하고, 게임 전체의 저장/로드 시스템을 Supabase와 연동합니다.
- [ ] **주요 작업:**
    1.  **`TitleScreen` 컴포넌트 개선:** (`src/components/TitleScreen.js`)
        - [ ] "게임 로드" 버튼 클릭 시 저장 슬롯 목록(`SaveSlotList` 컴포넌트 신규 구현 필요)을 표시합니다.
        - [ ] 슬롯 선택 시 해당 게임 상태를 로드하는 기능을 구현합니다 (`saves` 테이블 데이터 조회 및 `useGameState` 업데이트).
    2.  **Supabase 연동 (`saves` 테이블):**
        - [ ] `SystemMenu`의 "저장" 버튼 클릭 시 현재 게임 상태(`useGameState`)를 가져와 `saves` 테이블에 저장(UPSERT)하는 로직을 구현합니다.
        - [ ] `SystemMenu`의 "로드" 버튼 클릭 시 `saves` 테이블에서 데이터를 조회하여 `useGameState`를 업데이트하고 해당 씬으로 이동하는 로직을 구현합니다.
    3.  **`useGameState` 훅 개선:** (`src/hooks/useGameState.js`)
        - [ ] Supabase로부터 로드된 데이터로 게임 상태를 초기화하는 로직을 강화합니다.

## Phase 5: 부가 기능 및 폴리싱

- [ ] **목표:** 게임의 완성도를 높이기 위해 언어 설정, UI/UX 개선, 오디오 통합, 테스트 및 최적화를 진행합니다.
- [ ] **주요 작업:**
    1.  **언어 설정 기능 구현:**
        - [ ] 다국어 텍스트 관리 방안 결정 및 구현 (예: `public/script.json` 확장 또는 i18n 라이브러리 도입).
        - [ ] `SystemMenu` 및 `TitleScreen`에 언어 선택 UI 및 기능 구현.
    2.  **UI/UX 개선:**
        - [ ] `document/Frontend Guideline.md` 및 Tailwind CSS를 사용하여 전체 디자인 개선 (`src/index.css`, 각 컴포넌트 CSS 모듈).
        - [ ] 반응형 디자인 적용.
        - [ ] 씬 전환 애니메이션 추가.
    3.  **오디오 통합:**
        - [ ] `src/utils/audioManager.js`를 활용하여 배경 음악 및 효과음 추가.
        - [ ] 오디오 설정 기능 추가 (`SystemMenu`).
    4.  **테스트 및 최적화:**
        - [ ] 유닛 테스트 및 E2E 테스트 작성.
        - [ ] 성능 최적화 (React Profiler 활용).
        - [ ] 이미지 리소스 최적화.
    5.  **Supabase 보안 강화:**
        - [ ] `document/Backend Guideline.md` 참고하여 RLS 정책 설정.

**참고:** 이 계획은 프로젝트 진행 상황에 따라 유연하게 조정될 수 있습니다. 각 단계 완료 후 검토 및 테스트를 통해 다음 단계로 진행하는 것이 좋습니다.
