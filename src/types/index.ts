// src/types/index.ts
import { Dispatch, SetStateAction } from 'react';

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
  parentId?: string; // 부모 댓글 ID (대댓글인 경우)
  content: string;
  likes: number;
  is_player: boolean;
  created_at: string; // 생성 시간 (ISO 문자열) - 필수로 변경
  // delay?: number; // missions.json에서 사용할 지연 시간 (ms) - 제거
}

// Opinion 타입 정의 (CommentScene에서 이동)
export interface Opinion {
  positive: number;
  negative: number;
}

// 기사 추천/비추천 타입 정의 추가
export interface ArticleReactions {
  likes: number;
  dislikes: number;
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
  totalAttempts?: number; // max_attempts에서 이름 변경
  articleTitle?: string;
  articleContent?: string;
  articleImage?: string; // 이미지 파일 이름 (예: "oneroom.png")
  articleCreatedAt?: string; // 기사 생성 시간 (ISO 문자열) 추가
  // attachmentFilename?: string; // 제거
  initialOpinion?: Opinion; // neutral 제거됨
  initialLikes?: number; // 기사 좋아요 초기값
  initialDislikes?: number; // 기사 싫어요 초기값
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

// --- Types moved from useGameState.ts ---

// 선택지 옵션 타입 (Choices.tsx와 일치 또는 공유 타입 파일로 이동 고려)
export interface ChoiceOption {
  id: string | number;
  text: string;
  nextId?: string | number;
}

// 스크립트 라인 타입
export interface ScriptLine {
  id: string | number;
  type: string; // 'dialogue', 'choice', 'narrator' 등
  character?: string;
  text?: string;
  choices?: ChoiceOption[];
  nextId?: string | number;
  condition?: {
    flag: string;
    value: any; // 조건 값은 다양할 수 있음
  };
  altText?: string;
  expression?: string;
  nextScene?: SceneType; // 다음 씬 타입 추가
  // 필요한 다른 속성 추가 가능
}

// 스크립트 데이터 타입 (ScriptLine 배열)
export type ScriptData = ScriptLine[];

// 게임 플래그 타입 (문자열 키와 임의의 값)
export type GameFlags = Record<string, any>;

// useGameState Hook 반환 타입
export interface GameStateHook {
  currentScriptIndex: number;
  gameFlags: GameFlags;
  currentEpisodeId: string | null; // 현재 에피소드 ID
  sceneProgress: string; // 현재 씬 진행 단계 (예: 'intro', 'mission', 'ending')
  currentMissionId: string | null; // 현재 진행 중인 미션 ID
  remainingAttempts: number; // 현재 미션 남은 시도 횟수
  articleLikes: number; // 현재 기사 좋아요 수
  articleDislikes: number; // 현재 기사 싫어요 수
  setCurrentScriptIndex: Dispatch<SetStateAction<number>>;
  setGameFlags: Dispatch<SetStateAction<GameFlags>>;
  setCurrentEpisodeId: Dispatch<SetStateAction<string | null>>;
  setSceneProgress: Dispatch<SetStateAction<string>>;
  setCurrentMissionId: Dispatch<SetStateAction<string | null>>; // 미션 ID setter
  setRemainingAttempts: Dispatch<SetStateAction<number>>; // 시도 횟수 setter
  setArticleLikes: Dispatch<SetStateAction<number>>; // 좋아요 setter 추가
  setArticleDislikes: Dispatch<SetStateAction<number>>; // 싫어요 setter 추가
  handleLikeArticle: () => void; // 좋아요 핸들러
  handleDislikeArticle: () => void; // 싫어요 핸들러
  saveGame: () => void;
  loadGame: () => void;
}

// --- Types moved from useEpisodeLoader.ts ---

// 로컬 script.json 파일의 에피소드 데이터 구조 정의
export interface EpisodeData {
  id: string;
  title: string;
  intro_dialogues: ScriptLine[];
  ending_dialogues: ScriptLine[];
  mission_id: string; // 다음 댓글 미션 ID
}
