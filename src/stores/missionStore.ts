import { create } from "zustand";
import { Mission, Opinion } from "../types"; // Assuming Mission type is defined in src/types
// No need to import commentStore here, opinion will be passed as argument

interface MissionState {
  currentMission: Mission | null;
  isCompleted: boolean;
  remainingAttempts: number; // 남은 시도 횟수
  articleLikes: number; // 현재 기사 좋아요 수
  articleDislikes: number; // 현재 기사 싫어요 수
  opinion: Opinion; // 여론 상태 추가
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
  setOpinion: (opinion: Opinion) => void; // 여론 직접 설정 액션 추가
  // New action to check completion status
  checkMissionCompletion: () => boolean | null; // currentOpinion 인자 제거 (스토어 상태 사용)
  // TODO: 미션 관련 추가 액션 정의
}

// 여론 계산 헬퍼 함수
const calculateOpinion = (
  likes: number,
  dislikes: number,
  initialOpinion: Opinion
): Opinion => {
  const totalReactions = likes + dislikes;
  if (totalReactions > 0) {
    const positivePercent = Math.round((likes / totalReactions) * 100);
    return {
      positive: positivePercent,
      negative: 100 - positivePercent,
    };
  }
  return initialOpinion; // 반응 없으면 초기값 반환
};

export const useMissionStore = create<MissionState & MissionActions>(
  (set, get) => ({
    currentMission: null,
    isCompleted: false,
    remainingAttempts: 0, // 초기값 0 또는 미션 데이터 기반으로 설정 필요
    articleLikes: 0, // 초기 좋아요 0
    articleDislikes: 0, // 초기 싫어요 0
    opinion: { positive: 50, negative: 50 }, // 초기 여론 상태 추가
    // TODO: 추가 상태 초기값 설정

    setMission: (mission) => {
      const initialOpinion = mission?.initialOpinion ?? {
        positive: 50,
        negative: 50,
      };
      const initialLikes = mission?.initialLikes ?? 0;
      const initialDislikes = mission?.initialDislikes ?? 0;
      set({
        currentMission: mission,
        isCompleted: false,
        remainingAttempts: mission?.totalAttempts ?? 0,
        articleLikes: initialLikes,
        articleDislikes: initialDislikes,
        // 초기 여론 계산 및 설정
        opinion: calculateOpinion(
          initialLikes,
          initialDislikes,
          initialOpinion
        ),
      });
    },
    completeMission: () => set({ isCompleted: true }),
    decreaseAttempt: () =>
      set((state) => ({
        remainingAttempts: Math.max(0, state.remainingAttempts - 1), // 0 미만으로 내려가지 않도록
      })),
    setRemainingAttempts: (attempts) => set({ remainingAttempts: attempts }),
    likeArticle: () =>
      set((state) => {
        const newLikes = state.articleLikes + 1;
        const newOpinion = calculateOpinion(
          newLikes,
          state.articleDislikes,
          state.currentMission?.initialOpinion ?? { positive: 50, negative: 50 }
        );
        return { articleLikes: newLikes, opinion: newOpinion };
      }),
    dislikeArticle: () =>
      set((state) => {
        const newDislikes = state.articleDislikes + 1;
        const newOpinion = calculateOpinion(
          state.articleLikes,
          newDislikes,
          state.currentMission?.initialOpinion ?? { positive: 50, negative: 50 }
        );
        return { articleDislikes: newDislikes, opinion: newOpinion };
      }),
    setArticleLikes: (likes) =>
      set((state) => ({
        articleLikes: likes,
        opinion: calculateOpinion(
          likes,
          state.articleDislikes,
          state.currentMission?.initialOpinion ?? { positive: 50, negative: 50 }
        ),
      })),
    setArticleDislikes: (dislikes) =>
      set((state) => ({
        articleDislikes: dislikes,
        opinion: calculateOpinion(
          state.articleLikes,
          dislikes,
          state.currentMission?.initialOpinion ?? { positive: 50, negative: 50 }
        ),
      })),
    setOpinion: (opinion) => set({ opinion }), // 여론 직접 설정 액션 구현

    checkMissionCompletion: () => {
      // currentOpinion 인자 제거
      const { currentMission, remainingAttempts, isCompleted, opinion } = get(); // 스토어에서 opinion 가져오기

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
        isSuccess = opinion.positive >= positiveGoal; // currentOpinion -> opinion
        console.log(
          `Mission Completion Check: Positive Opinion ${
            opinion.positive // currentOpinion -> opinion
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
