import { create } from "zustand";
import { GameFlags } from "../types"; // Import GameFlags type

interface GameState {
  currentScene: string; // 예시 상태: 현재 게임 씬 (예: 'title', 'story', 'comment', 'result')
  isLoading: boolean; // 예시 상태: 로딩 중 여부
  gameFlags: GameFlags; // 게임 진행 중 사용되는 플래그
  currentEpisodeId: string | null; // 현재 플레이 중인 에피소드 ID
  sceneProgress: string; // 현재 씬 내에서의 진행 단계 (예: 'intro', 'main', 'outro')
  isCommentOverlayOpen: boolean; // 댓글 오버레이 열림 상태 추가
  activePostIdForComments: string | null; // 현재 댓글을 보고 있는 게시물 ID 추가
  // TODO: 게임 상태 관련 추가 상태 정의
}

interface GameActions {
  setCurrentScene: (scene: string) => void;
  setLoading: (loading: boolean) => void;
  setGameFlag: (flag: string, value: any) => void;
  setGameFlags: (flags: GameFlags) => void; // 플래그 전체 설정 액션 추가
  setCurrentEpisodeId: (episodeId: string | null) => void;
  setSceneProgress: (progress: string) => void;
  openCommentOverlay: (postId: string) => void; // 댓글 오버레이 열기 액션 추가
  closeCommentOverlay: () => void; // 댓글 오버레이 닫기 액션 추가
  // TODO: 게임 상태 관련 추가 액션 정의
  // TODO: Consider adding save/load logic here or in a separate utility/hook
}

export const useGameState = create<GameState & GameActions>((set) => ({
  currentScene: "title", // 초기 상태 설정
  isLoading: false, // 초기 상태 설정
  gameFlags: {}, // 초기 플래그
  currentEpisodeId: null, // 초기 에피소드 ID
  sceneProgress: "intro", // 초기 씬 진행 상태
  isCommentOverlayOpen: false, // 댓글 오버레이 초기 상태
  activePostIdForComments: null, // 활성 게시물 ID 초기 상태
  // TODO: 추가 상태 초기값 설정

  setCurrentScene: (scene) => set({ currentScene: scene }),
  setLoading: (loading) => set({ isLoading: loading }),
  setGameFlag: (flag, value) =>
    set((state) => ({ gameFlags: { ...state.gameFlags, [flag]: value } })),
  setGameFlags: (flags) => set({ gameFlags: flags }),
  setCurrentEpisodeId: (episodeId) => set({ currentEpisodeId: episodeId }),
  setSceneProgress: (progress) => set({ sceneProgress: progress }),
  openCommentOverlay: (postId) =>
    set({ isCommentOverlayOpen: true, activePostIdForComments: postId }),
  closeCommentOverlay: () =>
    set({ isCommentOverlayOpen: false, activePostIdForComments: null }),
  // TODO: 추가 액션 구현
}));
