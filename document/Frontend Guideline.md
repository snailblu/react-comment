# 1. 개요

이 가이드라인은 Opinion Manipulation Game의 프론트엔드 개발을 위한 표준을 제공합니다. React를 주요 프레임워크로 사용하며, 로컬 저장소(LocalStorage)와 클라이언트 측 로직을 통해 데이터 관리와 사용자 경험을 구현합니다. UI는 직관적이고 반응형으로 설계되며, 코드의 가독성과 재사용성을 보장합니다.

---

# 2. 기술 스택

- 프레임워크: React (필요 시 Next.js로 확장 가능)
    
- 스타일링: Tailwind CSS
    
- 상태 관리: React Context 또는 Redux (복잡도에 따라 선택)
        
- 타입 안전성: TypeScript (선택 사항, 권장)
    
- 배포: Vercel (권장)
    

---

# 3. 디렉토리 구조

```text
src/
├── assets/              # 이미지, 폰트 등 정적 자원
│   ├── images/
│   └── fonts/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 버튼, 모달 등 공통 컴포넌트
│   ├── scenes/         # 주요 씬별 컴포넌트 (Title, Story, Comment 등)
│   └── ui/             # 대화 상자, 입력 창 등 UI 요소
├── contexts/            # React Context (상태 관리)
├── hooks/               # 커스텀 훅 (예: useGameState, useScriptLoader)
├── pages/               # 라우팅 페이지 (Next.js 사용 시)
├── services/            # 외부 API 호출 로직 (예: LLM)
├── styles/              # Tailwind 설정 및 글로벌 스타일
├── types/               # TypeScript 타입 정의 (선택)
└── utils/               # 유틸리티 함수
```

---

# 4. 컴포넌트 설계 원칙

## 4.1 재사용성

- 공통 UI 요소(버튼, 모달 등)는 components/common/에 정의.
    
- 씬별 컴포넌트(예: StoryScene, CommentScene)는 독립적으로 동작하도록 설계.
    

## 4.2 명명 규칙

- 파일명: PascalCase (예: StoryScene.tsx)
    
- CSS 클래스: kebab-case (Tailwind 사용 시 클래스명 직접 작성 최소화)
    
- 변수/함수: camelCase (예: loadEpisodeData)
    

## 4.3 Props와 상태

- Props는 명확한 이름과 타입 정의 (TypeScript 사용 시).
    
- 로컬 상태는 useState, 전역 상태는 Context/Redux 활용.
    

---

# 5. 주요 컴포넌트 가이드

## 5.1 타이틀 화면 (TitleScreen)

- 기능: 새 게임 시작, 저장된 게임 로드, 언어 설정.

- 구성:
	- <Button>: "새 게임", "게임 로드", "언어 설정". 
	- <SaveSlotList>: 4개 슬롯 표시.        
- 스타일: Tailwind로 중앙 정렬, 반응형 버튼 크기.
- 로컬 저장소 연동: LocalStorage에서 저장 데이터 조회.
    

## 5.2 스토리 씬 (StoryScene)

- 기능: 대화 진행, 시스템 메뉴 제공.
    
- 구성:
    
    - <CharacterStanding>: 검은 실루엣 이미지.
        
    - <BackgroundImage>: 배경 렌더링.
        
    - <DialogueBox>: 텍스트 표시, 클릭 시 진행.
        
    - <PhoneChat>: 디티알톡 UI.
        
    - <SystemMenu>: 저장, 로드, 언어 변경 등.
        
- 스타일: 풀스크린 배경, 대화 상자는 하단 고정, 반투명 배경.
- 데이터 연동: 로컬 스크립트 파일(`public/script.json` 등)에서 대화 데이터 로드, 로컬 에셋 경로로 이미지 로드.
    

## 5.3 댓글 알바 씬 (CommentScene)

- 기능: 미션 표시, 댓글 입력, 여론 상태 업데이트.
    
- 구성:
    
    - <MissionPanel>: 목표, 키워드, 조건.
        
    - <OpinionStats>: 긍정/부정/중립 비율, 남은 기회.
        
    - <CommentList>: 베스트 3개 + 일반 5개 댓글.
        
    - <CommentInput>: 텍스트 입력 + 엔터 버튼.
        
    - <MonologueBox>: 주인공 독백.
        
- 스타일: 전화 UI 테마, 좌/우 패널은 고정 위치, 입력 창은 하단.
- 로직 연동: 클라이언트 측 로직으로 여론 계산 및 상태 업데이트.
    

## 5.4 결과 씬 (ResultScene)

- 기능: 성공/실패 메시지, NPC 피드백 표시.
    
- 구성:
    
    - <ResultMessage>: "축하합니다!" 등 텍스트.
        
    - <ClientFeedback>: LLM 생성 피드백.
        
- 스타일: 중앙 정렬 텍스트, 클릭 시 페이드 아웃 전환.
- API 연동: 클라이언트에서 직접 LLM API 호출 (예: Gemini).
    

## 5.5 엔딩 씬 (EndingScene)

- 기능: 엔딩 유형에 따른 메시지 표시.
    
- 구성:
    
    - <EndingMessage>: 배드/일반/히든 엔딩 텍스트.
        
- 스타일: 풀스크린 텍스트, 타이틀 복귀 버튼 포함.
- 데이터 연동: 로컬 스크립트 파일에서 엔딩 조건 및 텍스트 로드.
    

---

## 6. 스타일링 가이드 (Tailwind CSS)

6.1 기본 규칙

- 클래스명은 Tailwind의 유틸리티 사용 (예: flex justify-center items-center).
    
- 커스텀 스타일은 styles/global.css에 정의 후 @apply 활용.
    
- 반응형 디자인: sm:, md:, lg: 접두사로 브레이크포인트 설정.
    

## 6.2 테마

- 색상: 모바일 테마 기반 (검정, 회색, 흰색 중심).
    
    - Primary: #1F2937 (다크 그레이)
        
    - Secondary: #F3F4F6 (라이트 그레이)
        
    - Accent: #EF4444 (레드, 경고용)
        
- 폰트: 시스템 폰트 (font-sans), 대화는 가독성 높은 스타일.
    

## 6.3 예시

jsx

```jsx
<div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
  <h1 className="text-3xl font-bold mb-4">Opinion Manipulation Game</h1>
  <button className="px-4 py-2 bg-red-500 rounded hover:bg-red-600">새 게임</button>
</div>
```

---

# 7. 상태 관리

## 7.1 로컬 상태

- useState로 컴포넌트 내 상태 관리 (예: 대화 진행 인덱스).
    

jsx

```jsx
const [dialogueIndex, setDialogueIndex] = useState(0);
```

## 7.2 전역 상태

- Context: 게임 진행 상황, 사용자 설정 등.
    

jsx

```jsx
const GameContext = createContext();
const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({ episode: 1, progress: {} });
  // LocalStorage 연동 로직 추가
  return <GameContext.Provider value={{ gameState, setGameState }}>{children}</GameContext.Provider>;
};
```

- Redux (복잡 시): 미션 데이터, 여론 상태 관리.
    

---

# 8. 데이터 관리 (LocalStorage)

## 8.1 저장/로드

- `useGameState` 훅 또는 관련 유틸리티 함수에서 LocalStorage API (`localStorage.setItem`, `localStorage.getItem`)를 사용하여 게임 상태 저장 및 로드.
- 데이터는 JSON 형태로 직렬화하여 저장.

## 8.2 커스텀 훅

- `useGameState` 훅에서 게임 상태 관리 및 LocalStorage 연동 로직 캡슐화.

jsx

```jsx
const useGameState = () => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // 컴포넌트 마운트 시 LocalStorage에서 상태 로드
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      setState(JSON.parse(savedState));
    }
  }, []);

  const updateState = (newState) => {
    const updated = { ...state, ...newState };
    setState(updated);
    // 상태 변경 시 LocalStorage에 저장
    localStorage.setItem('gameState', JSON.stringify(updated));
  };

  return { gameState: state, updateGameState: updateState };
};
```

---

# 9. 성능 최적화

- 메모이제이션: useMemo, useCallback으로 불필요한 렌더링 방지.
    
- 이미지 최적화: 웹에 최적화된 이미지 포맷 사용 및 압축.
    
- 지연 로딩: React.lazy로 씬 컴포넌트 동적 로드.
- LocalStorage 사용 주의: 너무 크거나 복잡한 데이터를 자주 저장/로드하면 성능에 영향을 줄 수 있으므로 필요한 데이터만 관리.
    

---

# 10. 테스트

- 유닛 테스트: Jest + React Testing Library로 컴포넌트 동작 확인.
    
- E2E 테스트: Cypress로 주요 흐름 검증 (타이틀 → 엔딩).
