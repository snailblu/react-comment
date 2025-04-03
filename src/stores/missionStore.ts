import { create } from "zustand";
import { Mission, Opinion } from "../types"; // Assuming Mission type is defined in src/types
// No need to import commentStore here, opinion will be passed as argument

interface MissionState {
  currentMission: Mission | null;
  isCompleted: boolean;
  remainingAttempts: number; // 남은 시도 횟수
  articleLikes: number; // 현재 기사 좋아요 수
  articleDislikes: number; // 현재 기사 싫어요 수
  // TODO: 미션 관련 추가 상태 정의 (예: 진행률 등)
}

interface MissionActions {
  setMission: (mission: Mission | null) => void;
  completeMission: () => void;
  decreaseAttempt: () => void; // 시도 횟수 감소 액션
  setRemainingAttempts: (attempts: number) => void; // 시도 횟수 직접 설정 액션
  likeArticle: () => void; // 좋아요 액션
  dislikeArticle: () => void; // 싫어요 액션
  setArticleLikes: (likes: number) => void; // 좋아요 직접 설정
  setArticleDislikes: (dislikes: number) => void; // 싫어요 직접 설정
  // New action to check completion status
  checkMissionCompletion: (currentOpinion: Opinion) => boolean | null; // Returns success/failure or null if not applicable
  // TODO: 미션 관련 추가 액션 정의
}

export const useMissionStore = create<MissionState & MissionActions>(
  (set, get) => ({
    currentMission: null,
    isCompleted: false,
    remainingAttempts: 0, // 초기값 0 또는 미션 데이터 기반으로 설정 필요
    articleLikes: 0, // 초기 좋아요 0
    articleDislikes: 0, // 초기 싫어요 0
    // TODO: 추가 상태 초기값 설정

    setMission: (mission) =>
      set({
        currentMission: mission,
        isCompleted: false,
        // 미션 데이터에서 초기 시도 횟수, 좋아요/싫어요 가져오기
        remainingAttempts: mission?.totalAttempts ?? 0,
        articleLikes: mission?.initialLikes ?? 0,
        articleDislikes: mission?.initialDislikes ?? 0,
      }),
    completeMission: () => set({ isCompleted: true }),
    decreaseAttempt: () =>
      set((state) => ({
        remainingAttempts: Math.max(0, state.remainingAttempts - 1), // 0 미만으로 내려가지 않도록
      })),
    setRemainingAttempts: (attempts) => set({ remainingAttempts: attempts }),
    likeArticle: () =>
      set((state) => ({ articleLikes: state.articleLikes + 1 })),
    dislikeArticle: () =>
      set((state) => ({ articleDislikes: state.articleDislikes + 1 })),
    setArticleLikes: (likes) => set({ articleLikes: likes }),
    setArticleDislikes: (dislikes) => set({ articleDislikes: dislikes }),

    checkMissionCompletion: (currentOpinion) => {
      const { currentMission, remainingAttempts, isCompleted } = get();

      // Only check if attempts are 0 or less, mission exists, and not already completed
      if (remainingAttempts > 0 || !currentMission || isCompleted) {
        return null; // Not applicable to check status now
      }

      // Mark mission as completed (regardless of success/failure)
      set({ isCompleted: true });

      // Determine success based on goals
      // Example: Check positive opinion goal
      const positiveGoal = currentMission.goal?.positive;
      let isSuccess = false; // Default to failure

      if (positiveGoal !== undefined) {
        isSuccess = currentOpinion.positive >= positiveGoal;
        console.log(
          `Mission Completion Check: Positive Opinion ${
            currentOpinion.positive
          }% ${isSuccess ? ">=" : "<"} Goal ${positiveGoal}%`
        );
      } else {
        console.warn("Mission goal (positive) is not defined.");
        // Handle other goal types if necessary
      }

      // TODO: Implement checks for other goal types (negative opinion, etc.)

      console.log(
        `Mission ${currentMission.id} Completed. Success: ${isSuccess}`
      );
      return isSuccess; // Return success status
    },
    // TODO: 추가 액션 구현
  })
);
