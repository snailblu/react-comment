import { useCallback } from "react"; // useState, useEffect 제거
import { Opinion } from "../types"; // Opinion 타입 import
import { useMissionStore } from "../stores/missionStore"; // Import mission store

interface UseArticleStateResult {
  // opinion 상태는 스토어에서 직접 가져오므로 제거
  handleLikeArticle: () => void;
  handleDislikeArticle: () => void;
  setPredictedReactions: (added_likes: number, added_dislikes: number) => void;
}

const useArticleState =
  (): // initialLikes and initialDislikes are now primarily managed by missionStore via setMission
  // initialOpinion 인자 제거 (스토어에서 관리)
  UseArticleStateResult => {
    // Get actions from missionStore
    const { likeArticle, dislikeArticle, setArticleLikes, setArticleDislikes } =
      useMissionStore();

    // 로컬 opinion 상태 및 관련 useEffect 제거

    // 기사 좋아요 핸들러 (Call store action)
    const handleLikeArticle = useCallback(() => {
      likeArticle();
      // TODO: 필요시 추가 로직 (예: 게임 플래그 변경 등)
    }, [likeArticle]);

    // 기사 싫어요 핸들러 (Call store action)
    const handleDislikeArticle = useCallback(() => {
      dislikeArticle();
      // TODO: 필요시 추가 로직
    }, [dislikeArticle]);

    // Function to update store state based on AI predictions
    const setPredictedReactions = useCallback(
      (added_likes: number, added_dislikes: number) => {
        // Get current values from store and add predictions
        const currentLikes = useMissionStore.getState().articleLikes;
        const currentDislikes = useMissionStore.getState().articleDislikes;
        // 스토어 액션을 호출하여 좋아요/싫어요 및 opinion 업데이트
        setArticleLikes(currentLikes + added_likes);
        setArticleDislikes(currentDislikes + added_dislikes);
      },
      [setArticleLikes, setArticleDislikes] // 의존성 유지
    );

    return {
      // opinion 제거
      handleLikeArticle,
      handleDislikeArticle,
      setPredictedReactions,
    };
  };

export default useArticleState;
