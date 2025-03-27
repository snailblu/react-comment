# 1. 개요

이 가이드라인은 Opinion Manipulation Game의 프론트엔드 개발을 위한 표준을 제공합니다. React를 주요 프레임워크로 사용하며, Supabase와의 통합을 통해 데이터 관리와 사용자 경험을 최적화합니다. UI는 직관적이고 반응형으로 설계되며, 코드의 가독성과 재사용성을 보장합니다.

---

# 2. 기술 스택

- 프레임워크: React (필요 시 Next.js로 확장 가능)
    
- 스타일링: Tailwind CSS
    
- 상태 관리: React Context 또는 Redux (복잡도에 따라 선택)
    
- 데이터 통신: @supabase/supabase-js
    
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
├── hooks/               # 커스텀 훅 (예: useSupabase, useGameState)
├── pages/               # 라우팅 페이지 (Next.js 사용 시)
├── services/            # Supabase API 호출 로직
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
    
- 변수/함수: camelCase (예: fetchEpisodeData)
    

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
- Supabase 연동: supabase.from('saves').select()로 저장 데이터 조회.
    

## 5.2 스토리 씬 (StoryScene)

- 기능: 대화 진행, 시스템 메뉴 제공.
    
- 구성:
    
    - <CharacterStanding>: 검은 실루엣 이미지.
        
    - <BackgroundImage>: 배경 렌더링.
        
    - <DialogueBox>: 텍스트 표시, 클릭 시 진행.
        
    - <PhoneChat>: 디티알톡 UI.
        
    - <SystemMenu>: 저장, 로드, 언어 변경 등.
        
- 스타일: 풀스크린 배경, 대화 상자는 하단 고정, 반투명 배경.
    
- Supabase 연동: supabase.storage.from('assets')로 이미지 로드.
    

## 5.3 댓글 알바 씬 (CommentScene)

- 기능: 미션 표시, 댓글 입력, 여론 상태 업데이트.
    
- 구성:
    
    - <MissionPanel>: 목표, 키워드, 조건.
        
    - <OpinionStats>: 긍정/부정/중립 비율, 남은 기회.
        
    - <CommentList>: 베스트 3개 + 일반 5개 댓글.
        
    - <CommentInput>: 텍스트 입력 + 엔터 버튼.
        
    - <MonologueBox>: 주인공 독백.
        
- 스타일: 전화 UI 테마, 좌/우 패널은 고정 위치, 입력 창은 하단.
    
- Supabase 연동: supabase.rpc('update_opinion')로 실시간 여론 계산.
    

## 5.4 결과 씬 (ResultScene)

- 기능: 성공/실패 메시지, NPC 피드백 표시.
    
- 구성:
    
    - <ResultMessage>: "축하합니다!" 등 텍스트.
        
    - <ClientFeedback>: LLM 생성 피드백.
        
- 스타일: 중앙 정렬 텍스트, 클릭 시 페이드 아웃 전환.
    
- Supabase 연동: supabase.functions.invoke('generate_feedback') 호출.
    

## 5.5 엔딩 씬 (EndingScene)

- 기능: 엔딩 유형에 따른 메시지 표시.
    
- 구성:
    
    - <EndingMessage>: 배드/일반/히든 엔딩 텍스트.
        
- 스타일: 풀스크린 텍스트, 타이틀 복귀 버튼 포함.
    

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
  return <GameContext.Provider value={{ gameState, setGameState }}>{children}</GameContext.Provider>;
};
```

- Redux (복잡 시): 미션 데이터, 여론 상태 관리.
    

## 7.3 Supabase와 동기화

- useEffect로 데이터 페칭 및 실시간 구독.
    

jsx

```jsx
useEffect(() => {
  const subscription = supabase
    .channel('opinion-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'opinions' }, (payload) =>
      setOpinionState(payload.new)
    )
    .subscribe();
  return () => subscription.unsubscribe();
}, []);
```

---

# 8. Supabase 통합

## 8.1 클라이언트 설정

- src/services/supabase.js에 초기화.
    

jsx

```jsx
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY);
```

## 8.2 커스텀 훅

- useSupabase로 데이터 조회/업데이트 캡슐화.
    

jsx

```jsx
const useSupabase = () => {
  const fetchEpisode = async (id) => {
    const { data } = await supabase.from('episodes').select('*').eq('id', id).single();
    return data;
  };
  return { fetchEpisode };
};
```

---

# 9. 성능 최적화

- 메모이제이션: useMemo, useCallback으로 불필요한 렌더링 방지.
    
- 이미지 최적화: Supabase Storage에서 압축된 이미지 사용.
    
- 지연 로딩: React.lazy로 씬 컴포넌트 동적 로드.
    

---

# 10. 테스트

- 유닛 테스트: Jest + React Testing Library로 컴포넌트 동작 확인.
    
- E2E 테스트: Cypress로 주요 흐름 검증 (타이틀 → 엔딩).