# 1. 개요

이 문서는 Opinion Manipulation Game의 데이터 관리 및 로직 구조를 정의합니다. 게임은 클라이언트 측(브라우저)에서 대부분의 로직을 처리하며, 브라우저의 로컬 저장소(LocalStorage)를 사용하여 게임 상태와 진행 상황을 저장합니다. LLM API는 클라이언트에서 직접 호출됩니다.

---

# 2. 기술 스택

- 주 로직 처리: React (클라이언트 측 JavaScript)
    
- 데이터 저장소: 브라우저 LocalStorage
    
- LLM 통합: Google Gemini (또는 대체 오픈소스 모델, 클라이언트에서 직접 호출)
    
- 정적 자산 서빙: 웹 서버 (예: `npm start`의 개발 서버 또는 정적 호스팅)
    

---

# 3. 로컬 데이터 구조

브라우저의 LocalStorage를 사용하여 게임 데이터를 관리합니다. 데이터는 주로 JSON 형태로 직렬화되어 저장됩니다.

## 3.1 저장 데이터 예시 (`localStorage` 키 기준)

`game_save_slot_1` (슬롯 1~4)

- 설명: 플레이어 진행 상황 저장.
    
- 구조 (JSON):
    
    ```json
    {
      "episodeId": "episode-1",
      "sceneIndex": 5,
      "opinionStats": {
        "mission-1": { "positive": 30, "negative": 60, "neutral": 10, "attemptsLeft": 2 }
      },
      "playerChoices": {
        "episode-1-choice-1": "optionA"
      },
      "settings": { "language": "ko", "volume": 0.8 },
      "updatedAt": "2025-03-28T17:00:00Z"
    }
    ```
    

`game_settings`

- 설명: 기본 게임 설정 (언어, 볼륨 등).
    
- 구조 (JSON):
    
    ```json
    { "language": "ko", "volume": 0.8 }
    ```
    

**참고:** 게임 스크립트(대화, 미션 정보, 엔딩 조건 등)는 `public/script.json`과 같은 정적 파일로 관리하고, 게임 시작 시 로드하여 메모리에서 사용합니다.

---

# 4. 핵심 로직 (클라이언트 측)

게임의 주요 로직은 React 컴포넌트 및 훅 내에서 처리됩니다.

## 4.1 주요 로직 함수 (예시)

`updateOpinion(missionId, comment)`

- 설명: 댓글 제출 시 여론 상태 계산 및 로컬 상태 업데이트.
    
- 위치: `useGameState` 훅 또는 관련 컨텍스트.
    
- 로직:
    
    1. 댓글 키워드/조건 검증 (스크립트 데이터 기반).
        
    2. 여론 비율 계산 (간단한 룰 기반).
        
    3. `useGameState` 훅의 상태 업데이트.
        

`generateFeedback(missionId, commentHistory)`

- 설명: 결과 씬에서 NPC 피드백 생성.
    
- 위치: `ResultScene` 컴포넌트 또는 관련 훅.
    
- 로직:
    
    1. 클라이언트에서 직접 Gemini API 호출 (API 키는 환경 변수 사용).
        
    2. 미션 성과 기반 프롬프트 생성 및 API 호출.
        
    3. 반환된 피드백을 상태에 저장하여 UI에 표시.
        

`checkEnding(episodeProgress)`

- 설명: 엔딩 조건 확인 및 결과 반환.
    
- 위치: `ResultScene` 또는 `App.tsx`.
    
- 로직:
    
    1. 로드된 스크립트의 엔딩 조건과 현재 게임 상태 비교.
        
    2. 해당하는 엔딩 타입 반환.
        

`saveGame(slot)`

- 설명: 현재 게임 상태를 로컬 저장소에 저장.
    
- 위치: `SystemMenu` 컴포넌트 또는 `useGameState` 훅.
    
- 로직:
    
    1. `useGameState` 훅에서 현재 상태 가져오기.
        
    2. JSON으로 직렬화하여 `localStorage.setItem()` 호출.
        

`loadGame(slot)`

- 설명: 로컬 저장소에서 게임 상태 로드.
    
- 위치: `TitleScreen` 컴포넌트 또는 `useGameState` 훅.
    
- 로직:
    
    1. `localStorage.getItem()` 호출 및 JSON 파싱.
        
    2. `useGameState` 훅의 상태 업데이트 및 해당 씬으로 이동.
        

---

# 5. 실시간 업데이트

별도의 실시간 구독 메커니즘은 사용하지 않습니다. UI 업데이트는 React의 상태 관리 시스템(`useState`, `useReducer`, Context API 등)을 통해 이루어집니다. 여론 상태 변경 등은 로컬 상태가 업데이트되면 자동으로 UI에 반영됩니다.

---

# 6. 정적 자산 관리

게임에 필요한 이미지, 오디오 등의 자산은 `public` 폴더에 위치시키고, 웹 서버를 통해 정적으로 서빙합니다.

- 예시 경로: `/characters/char1.png`, `/audio/bgm.mp3`
    
- 접근: React 컴포넌트에서 상대 경로 또는 절대 경로(`/`)를 사용하여 직접 참조합니다.
    

---

# 7. 보안

- API 키 관리:
    
    - LLM API 키는 `.env` 파일에 저장하고, 빌드 시 환경 변수(`process.env.REACT_APP_LLM_API_KEY`)로 주입합니다.
        
    - **주의:** 클라이언트 측 코드에 API 키가 직접 노출될 수 있으므로, API 키에 사용량 제한 또는 특정 도메인 제한 등의 보안 설정을 적용하는 것이 중요합니다.
        
- 입력 검증: 댓글 등 사용자 입력은 클라이언트 측에서 기본적인 유효성 검사(길이 제한 등)를 수행합니다.
    

---

# 8. 성능 최적화

- React 최적화: `React.memo`, `useMemo`, `useCallback` 등을 활용하여 불필요한 리렌더링 방지.
    
- 코드 스플리팅: React Router 등을 사용하여 씬별로 코드를 분할 로딩.
    
- 자산 최적화: 이미지 압축, 오디오 포맷 최적화.
    
- LocalStorage 사용 주의: 너무 크거나 복잡한 데이터를 자주 저장/로드하면 성능에 영향을 줄 수 있으므로 필요한 데이터만 관리합니다.
    

---

# 9. LLM 통합 (Google Gemini)

- 호출: 클라이언트 측 JavaScript (`fetch` API 사용)에서 직접 Gemini API 호출.
    
- 예시 (React 컴포넌트 내):
    

javascript

```javascript
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

async function fetchFeedback(commentHistory) {
  try {
    const response = await fetch('https://gemini-api-endpoint', { // 실제 엔드포인트로 변경 필요
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Gemini API 키 인증 방식에 따라 헤더 구성 (예: 'x-goog-api-key': apiKey)
      },
      body: JSON.stringify({ prompt: `Generate feedback for ${commentHistory}` }), // API 요구사항에 맞게 수정
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const data = await response.json();
    setFeedback(data.feedback); // 상태 업데이트
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    // 오류 처리 로직
  }
}
```

- 대체: 비용 절감 또는 오프라인 지원 필요 시, WebAssembly 기반의 경량 로컬 모델 실행 고려 (기술적 복잡도 높음).
    

---

# 10. 배포 및 모니터링

- 배포: 빌드된 정적 파일(HTML, CSS, JS)을 Netlify, Vercel, GitHub Pages 등 정적 호스팅 서비스에 배포.
    
- 모니터링: 브라우저 개발자 도구(콘솔, 네트워크 탭)를 사용하여 클라이언트 측 오류 및 성능 추적. 필요 시 Sentry 등 프론트엔드 에러 로깅 서비스 도입 고려.
