# 1. 개요

이 문서는 Opinion Manipulation Game의 백엔드 구조를 정의합니다. Supabase를 활용해 데이터베이스, 인증, 실시간 업데이트, 서버리스 함수를 구현하며, 게임의 스토리 진행, 댓글 알바 미션, 여론 계산, 엔딩 처리를 지원합니다. 백엔드는 프론트엔드와 RESTful API 및 실시간 구독을 통해 상호작용합니다.

---

# 2. 기술 스택

- 백엔드 플랫폼: Supabase
    
- 데이터베이스: PostgreSQL (Supabase 제공)
    
- 서버리스 함수: Supabase Edge Functions (Deno 기반)
    
- LLM 통합: Google Gemini (또는 대체 오픈소스 모델)
    
- 스토리지: Supabase Storage (이미지, 자산 저장)
    
- 인증: Supabase Auth (선택 사항, 필요 시)
    

---

# 3. 데이터베이스 스키마

Supabase의 PostgreSQL을 기반으로 테이블을 설계합니다. 각 테이블은 게임의 핵심 데이터를 관리합니다.

## 3.1 테이블 정의

episodes

- 설명: 게임의 에피소드 데이터 저장.
    
- 컬럼:
    
    - id (UUID, PK): 에피소드 고유 ID
        
    - title (TEXT): 에피소드 제목
        
    - intro_dialogues (JSONB): 인트로 대화 데이터
        
    - ending_dialogues (JSONB): 엔딩 대화 데이터
        
    - mission_id (UUID, FK): 연결된 미션 ID
        

missions

- 설명: 댓글 알바 미션의 목표, 키워드, 조건 저장.
    
- 컬럼:
    
    - id (UUID, PK): 미션 고유 ID
        
    - title (TEXT): 미션 제목
        
    - goal (JSONB): 목표 (예: { "negative": 70 })
        
    - keywords (TEXT[]): 필수 키워드 배열
        
    - conditions (TEXT[]): 조건 (예: "탑스타 피해 없음")
        
    - max_attempts (INTEGER): 최대 댓글 시도 횟수
        

opinions

- 설명: 현재 여론 상태 저장 및 실시간 업데이트.
    
- 컬럼:
    
    - id (UUID, PK): 여론 상태 ID
        
    - mission_id (UUID, FK): 연결된 미션 ID
        
    - positive (INTEGER): 긍정 비율 (%)
        
    - negative (INTEGER): 부정 비율 (%)
        
    - neutral (INTEGER): 중립 비율 (%)
        
    - updated_at (TIMESTAMP): 마지막 업데이트 시간
        

comments

- 설명: 플레이어 및 NPC 댓글 저장.
    
- 컬럼:
    
    - id (UUID, PK): 댓글 ID
        
    - mission_id (UUID, FK): 연결된 미션 ID
        
    - content (TEXT): 댓글 내용
        
    - likes (INTEGER): 좋아요 수
        
    - is_player (BOOLEAN): 플레이어 작성 여부
        
    - created_at (TIMESTAMP): 작성 시간
        

saves

- 설명: 플레이어 진행 상황 저장 (4개 슬롯).
    
- 컬럼:
    
    - id (UUID, PK): 저장 ID
        
    - slot (INTEGER): 슬롯 번호 (1~4)
        
    - episode_id (UUID, FK): 현재 에피소드
        
    - mission_progress (JSONB): 미션 진행 상태
        
    - updated_at (TIMESTAMP): 저장 시간
        

endings

- 설명: 엔딩 조건 및 메시지 저장.
    
- 컬럼:
    
    - id (UUID, PK): 엔딩 ID
        
    - type (TEXT): "bad1", "bad2", "normal", "hidden"
        
    - message (TEXT): 엔딩 메시지
        
    - conditions (JSONB): 트리거 조건 (예: { "all_missions_cleared": true })
        

---

# 4. API 엔드포인트

Supabase의 기본 REST API를 활용하며, 필요 시 Edge Function으로 커스텀 로직 추가.

## 4.1 기본 REST API (Supabase 제공)

- GET /episodes: 에피소드 목록 조회
    
    - 필터: ?id=eq.{id}
        
- GET /missions: 미션 데이터 조회
    
    - 필터: ?id=eq.{id}
        
- GET /opinions: 여론 상태 조회
    
    - 필터: ?mission_id=eq.{id}
        
- POST /comments: 댓글 생성
    
    - 바디: { "mission_id": UUID, "content": TEXT }
        
- GET /saves: 저장 슬롯 조회
    
    - 필터: ?slot=eq.{number}
        
- UPSERT /saves: 진행 상황 저장/업데이트
    
    - 바디: { "slot": INTEGER, "episode_id": UUID, "mission_progress": JSON }
        

## 4.2 Edge Functions (커스텀 로직)

update-opinion

- 설명: 댓글 제출 시 여론 상태 계산 및 업데이트.
    
- 입력: { "mission_id": UUID, "comment": TEXT }
    
- 로직:
    
    1. 댓글 키워드/조건 검증.
        
    2. 여론 비율 계산 (간단한 룰 기반 또는 LLM 활용).
        
    3. opinions 테이블 업데이트.
        
- 출력: { "positive": INTEGER, "negative": INTEGER, "neutral": INTEGER }
    

generate-feedback

- 설명: 결과 씬에서 NPC 피드백 생성.
    
- 입력: { "mission_id": UUID, "comment_history": TEXT[] }
    
- 로직:
    
    1. Gemini API 호출 (또는 대체 LLM).
        
    2. 미션 성과 기반 2문장 피드백 생성.
        
- 출력: { "feedback": TEXT }
    

## check-ending

- 설명: 엔딩 조건 확인 및 결과 반환.
    
- 입력: { "episode_progress": JSON }
    
- 로직:
    
    1. endings 테이블 조건과 비교.
        
    2. 해당 엔딩 ID 반환.
        
- 출력: { "ending_id": UUID }
    

---

# 5. 실시간 구독

Supabase의 실시간 기능을 활용해 프론트엔드에 즉각적인 업데이트 제공.

## 5.1 구독 대상

- 테이블: opinions
    
    - 이벤트: UPDATE
        
    - 용도: 댓글 제출 후 여론 상태 실시간 반영.
        
- 구현 예시 (프론트엔드에서):
    

javascript

```javascript
supabase
  .channel('opinion-updates')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'opinions' }, (payload) => {
    updateOpinionState(payload.new);
  })
  .subscribe();
```

---

# 6. 스토리지

Supabase Storage를 사용해 게임 자산 관리.

## 6.1 버킷 구조

- 버킷: game-assets
    
    - /characters: 캐릭터 스탠딩 이미지 (검은 실루엣)
        
    - /backgrounds: 배경 이미지
        
    - /ui: UI 요소 (버튼, 전화 테마 등)
        

## 6.2 접근 제어

- 정책: 공개 읽기 전용 (SELECT 허용, 쓰기는 서버에서만).
    
- URL 예시: supabase.storage.from('game-assets').getPublicUrl('characters/char1.png')
    

---

# 7. 보안

- Row-Level Security (RLS):
    
    - saves: 슬롯별 사용자 접근 제한 (인증 필요 시 auth.uid() 기반).
        
    - comments: 미션별 댓글만 조회 가능 (mission_id 필터링).
        
- API 키: .env에 저장, 프론트엔드에서 안전하게 호출.
    
- 입력 검증: Edge Function에서 댓글 내용 검증 (공격적 표현 필터링).
    

---

# 8. 성능 최적화

- 인덱싱: mission_id, episode_id에 인덱스 추가.
    
- 캐싱: 자주 조회되는 episodes 데이터는 Edge Function에서 캐시.
    
- 배치 처리: 댓글 제출 시 여론 계산을 배치로 처리해 부하 감소.
    

---

# 9. LLM 통합 (Google Gemini)

- 호출: Edge Function에서 Gemini API 호출.
    
- 예시 (Deno):
    

javascript

```javascript
Deno.serve(async (req) => {
  const { mission_id, comment_history } = await req.json();
  const response = await fetch('https://gemini-api-endpoint', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}` },
    body: JSON.stringify({ prompt: `Generate feedback for ${comment_history}` }),
  });
  const feedback = await response.json();
  return new Response(JSON.stringify({ feedback }), { status: 200 });
});
```

- 대체: 비용 절감 시 Mistral 또는 LLaMA 로컬 실행 고려.
    

---

# 10. 배포 및 모니터링

- 배포: Supabase 대시보드에서 테이블, 함수, 정책 관리.
    
- 모니터링: Supabase 로그로 API 호출 및 오류 추적.
    
- 백업: PostgreSQL 자동 백업 설정.