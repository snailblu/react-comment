# TODO 리스트

이 문서는 프로젝트 진행 중 필요한 작업 목록을 관리합니다.

---

## 개발 계획 기반 TODO 리스트 (MVP 범위: Phase 1-3)

### Phase 1: 기반 구축 및 핵심 씬 설정

- [ ] **1-1. 프로젝트 설정 확인:**
  - [ ] Zustand 스토어 (`gameStateStore`, `storyStore`, `missionStore`) 기본 구조 정의 완료 확인.
  - [ ] `App.tsx`에서 `HashRouter` 및 핵심 씬 라우팅 (`/`, `/game`, `/instagram/:missionId`, `/result`) 설정 확인.
  - [ ] `GameViewport.tsx` 기본 레이아웃 구현 확인.
  - [ ] 전역 CSS (`index.css`) 및 `tailwind.config.js`에 Neo둥근모 Pro 폰트 적용 및 앤티앨리어싱 비활성화 설정 확인.
- [ ] **1-2. 데이터 로딩 시스템 구현:**
  - [ ] `useScriptLoader` 훅 구현 (script.json 로딩).
  - [ ] `useEpisodeLoader` 훅 구현 (episode 관련 데이터 로딩 - 필요시).
  - [ ] `useMissionData` 훅 구현 (missions.json 로딩).
  - [ ] Electron 환경 고려한 경로 처리 확인.
- [ ] **1-3. 타이틀 화면 (`TitleScreen.tsx`) 구현:**
  - [ ] 게임 로고 이미지 표시.
  - [ ] '시작하기' 버튼 UI 구현 (픽셀 아트 스타일).
  - [ ] '시작하기' 버튼 클릭 시 `/game` 경로 이동 기능 구현.
- [ ] **1-4. 스토리 씬 (`StoryScene.tsx`) 기본 표시 기능 구현:**
  - [ ] `storyStore` 연동하여 현재 스크립트 데이터 표시.
  - [ ] `DialogueBox.tsx` 컴포넌트 구현 및 대사 표시.
  - [ ] `Background.tsx` 컴포넌트 구현 및 배경 이미지 표시.
  - [ ] `Character.tsx` 컴포넌트 구현 및 캐릭터 실루엣 표시.
  - [ ] 스크립트 데이터의 `next` ID를 따라 다음 스토리로 진행하는 기본 로직 구현 (`storyStore` 액션 호출).

### Phase 2: 핵심 게임 플레이 구현 - 인스타그램 활동

- [ ] **2-1. 인스타그램 활동 씬 (`InstagramActivityScene.tsx` - 가칭) 기본 설정:**
  - [ ] 컴포넌트 파일 생성 (`src/components/InstagramActivityScene.tsx`).
  - [ ] `App.tsx`에 `/instagram/:missionId` 경로 라우팅 추가.
  - [ ] `useParams` 훅 사용하여 `missionId` 추출.
  - [ ] `missionStore` 연동하여 `missionId`에 해당하는 미션 데이터 로드.
  - [ ] `MissionPanel.tsx` 컴포넌트 생성 및 미션 정보 표시 UI 구현.
  - [ ] 인스타그램 피드/프로필 형태 기본 레이아웃 구성.
  - [ ] `instagramStore` (가칭) 스토어 파일 생성 및 기본 상태/액션 정의.
- [ ] **2-2. 콘텐츠 게시 시뮬레이션:**
  - [ ] `InstagramPostInput.tsx` (가칭) 컴포넌트 생성.
  - [ ] 텍스트 입력 필드 UI 구현 (픽셀 아트 스타일).
  - [ ] 이미지 선택 UI 구현 (미리 정의된 목록 기반).
  - [ ] '게시' 버튼 UI 구현 (픽셀 아트 스타일).
  - [ ] '게시' 버튼 클릭 시 입력된 텍스트/선택된 이미지 정보를 `instagramStore`에 저장하는 액션 구현.
- [ ] **2-3. 기본 반응 표시:**
  - [ ] `ReactionStats.tsx` (가칭) 컴포넌트 생성.
  - [ ] `instagramStore` 연동하여 좋아요, 댓글 수, 팔로워 수 표시 UI 구현 (아이콘 + 숫자).
  - [ ] `InstagramCommentList.tsx` (가칭) 컴포넌트 생성.
  - [ ] `missionStore`의 초기 댓글/DM 데이터를 가져와 리스트 형태로 표시하는 UI 구현.
- [ ] **2-4. 기본 LLM 연동 (조건 판별):**
  - [ ] 게시물 제출 시, 해당 게시물 내용과 `missionStore`의 미션 조건(키워드, 해시태그 등)을 비교하는 로직 구현.
  - [ ] 조건 충족 여부에 따라 `instagramStore`의 반응 수치(좋아요 등)를 기본적으로 업데이트하는 액션 구현.

### Phase 3: 게임 루프 완성 및 MVP 마무리

- [ ] **3-1. 결과 씬 (`ResultScene.tsx`) 구현:**
  - [ ] 컴포넌트 파일 생성 (`src/components/ResultScene.tsx`).
  - [ ] `App.tsx`에 `/result` 경로 라우팅 추가.
  - [ ] `missionStore` 또는 `instagramStore` 상태 기반으로 미션 성공/실패 텍스트 표시.
  - [ ] '다음으로' 버튼 UI 구현 (픽셀 아트 스타일).
  - [ ] '다음으로' 버튼 클릭 시 다음 스토리 ID로 이동하는 로직 구현 (`storyStore` 액션 호출).
- [ ] **3-2. 스토리 씬 (`StoryScene.tsx`) - 선택지 및 분기 구현:**
  - [ ] `Choices.tsx` 컴포넌트 생성.
  - [ ] 스크립트 데이터 타입이 'choices'일 경우, `Choices.tsx`를 통해 선택지 버튼 목록 표시.
  - [ ] 선택지 버튼 클릭 시 해당 선택지의 `next` 스토리 ID로 진행하는 로직 구현 (`storyStore` 액션 호출).
- [ ] **3-3. 기본 엔딩 구현:**
  - [ ] 특정 스토리 ID 도달 시 엔딩으로 간주하는 로직 구현.
  - [ ] 간단한 엔딩 텍스트 또는 이미지 표시 컴포넌트 생성 및 라우팅 연결.
  - [ ] 배드 엔딩/노멀 엔딩 분기 조건 정의 및 로직 구현 (예: 미션 실패 횟수).
- [ ] **3-4. 기본 저장/불러오기 구현 (1 슬롯):**
  - [ ] Zustand `persist` 미들웨어 설정 (`gameStateStore`, `storyStore`, `missionStore` 등 필요한 스토어에 적용).
  - [ ] 로컬 스토리지 저장 확인.
  - [ ] 타이틀 화면 또는 설정 메뉴에 '저장', '불러오기' 버튼 UI 구현 (1 슬롯 기준).
  - [ ] '저장' 버튼 클릭 시 현재 상태 저장 로직 연결.
  - [ ] '불러오기' 버튼 클릭 시 저장된 상태 로드 및 적용 로직 연결.
- [ ] **3-5. 픽셀 아트 스타일 적용:**
  - [ ] Phase 1-3에서 구현된 모든 UI 컴포넌트(버튼, 입력 필드, 대화창, 패널 등) 검토 및 픽셀 아트 스타일 적용 완료 확인.
  - [ ] Neo둥근모 Pro 폰트 렌더링 (앤티앨리어싱 비활성화) 확인.
- [ ] **3-6. 기본 오디오 적용:**
  - [ ] `audioManager.ts` 유틸리티 구현 확인.
  - [ ] 타이틀 화면 BGM 재생.
  - [ ] 씬 전환 시 BGM 변경 (필요시).
  - [ ] 버튼 클릭 효과음 재생.

---

_(추후 다른 작업 항목 추가 가능)_
