// src/types/index.ts

// 기존 타입 정의 유지
export interface DialogueLine {
  character?: string; // 옵셔널 처리
  line: string;
  expression?: string; // 표정 추가
  position?: 'left' | 'right' | 'center'; // 위치 추가
  audio?: string; // 오디오 파일 경로 추가
}

export interface Choice {
  text: string;
  nextSceneId: string;
  opinionChange?: { // 여론 변화 추가
    positive?: number;
    negative?: number;
    neutral?: number;
  };
}

export interface Scene {
  id: string;
  type: 'dialogue' | 'monologue' | 'choice' | 'phone' | 'comment' | 'ending' | 'result'; // 'comment', 'ending', 'result' 타입 추가
  background?: string;
  dialogue?: DialogueLine[];
  monologue?: string;
  choices?: Choice[];
  nextSceneId?: string; // 다음 씬 ID (선택적)
  phoneMessages?: { sender: 'player' | 'other'; text: string }[]; // 폰 메시지 타입 추가
  missionId?: string; // 댓글 미션 ID 추가
  endingType?: 'good_ending' | 'bad_ending' | 'neutral_ending'; // 엔딩 타입 추가
  resultData?: any; // 결과 데이터 (추후 구체화)
  audio?: string; // 씬 배경 음악 또는 효과음
}

// SceneType 별칭 추가 및 export
export type SceneType = Scene['type'];

export interface Script {
  [key: string]: Scene;
}

// Comment 타입 정의 (CommentScene에서 이동)
export interface Comment {
  id: string;
  nickname?: string;
  ip?: string; // IP 주소 (ipRange 제거)
  isReply?: boolean;
  content: string;
  likes: number;
  is_player: boolean;
  created_at?: string; // 생성 시간 (ISO 문자열)
  // delay?: number; // missions.json에서 사용할 지연 시간 (ms) - 제거
}

// Opinion 타입 정의 (CommentScene에서 이동)
export interface Opinion {
  positive: number;
  negative: number;
  neutral: number;
}

// Mission 타입 정의 추가
export interface Mission {
  id: string;
  title: string;
  goal?: {
    positive?: number;
    negative?: number;
    // 다른 목표 조건 추가 가능
  };
  keywords?: string[];
  conditions?: string[];
  max_attempts?: number;
  articleTitle?: string;
  articleContent?: string;
  articleImage?: string; // 이미지 파일 이름 (예: "oneroom.png")
  articleCreatedAt?: string; // 기사 생성 시간 (ISO 문자열) 추가
  // attachmentFilename?: string; // 제거
  initialOpinion?: Opinion;
  initialMonologue?: string;
  initialComments?: Partial<Comment & { delay?: number }>[]; // 로딩 시 delay 또는 created_at 사용 가능하도록 유지
}

// Settings 타입 정의
export interface Settings {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  textSize: number;
  textSpeed: number;
  autoPlaySpeed: number;
  language: string;
}
