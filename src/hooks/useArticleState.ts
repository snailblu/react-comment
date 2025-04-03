import { useState, useEffect, useCallback } from "react";
import { Opinion } from "../types"; // Opinion 타입 import
import { useMissionStore } from "../stores/missionStore"; // Import mission store

interface UseArticleStateResult {
  // articleLikes and articleDislikes will come from the store
  opinion: Opinion; // Keep opinion calculation local to this hook
  handleLikeArticle: () => void;
  handleDislikeArticle: () => void;
  setPredictedReactions: (added_likes: number, added_dislikes: number) => void;
}

const useArticleState = (
  // initialLikes and initialDislikes are now primarily managed by missionStore via setMission
  initialOpinion: Opinion = { positive: 50, negative: 50 }
): UseArticleStateResult => {
  // Get state and actions from missionStore
  const {
    articleLikes,
    articleDislikes,
    likeArticle,
    dislikeArticle,
    setArticleLikes,
    setArticleDislikes,
  } = useMissionStore();

  // Keep opinion state local to this hook
  const [opinion, setOpinion] = useState<Opinion>(initialOpinion);

  // Update local opinion state when initialOpinion prop changes
  useEffect(() => {
    setOpinion(initialOpinion);
  }, [initialOpinion]);

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

  // 기사 반응 변경 시 여론 업데이트 (Use values from store)
  useEffect(() => {
    const totalReactions = articleLikes + articleDislikes;
    if (totalReactions > 0) {
      const positivePercent = Math.round((articleLikes / totalReactions) * 100);
      const negativePercent = 100 - positivePercent; // 나머지를 부정으로 계산

      setOpinion({
        positive: positivePercent,
        negative: negativePercent,
      });
    } else {
      // 반응이 없으면 초기 여론으로 설정 (훅 인자로 받은 값 사용)
      setOpinion(initialOpinion);
    }
    // initialOpinion도 의존성에 추가하여 초기값 변경 시 재계산
  }, [articleLikes, articleDislikes, initialOpinion]); // Depend on store values

  // Function to update store state based on AI predictions
  const setPredictedReactions = useCallback(
    (added_likes: number, added_dislikes: number) => {
      // Get current values from store and add predictions
      const currentLikes = useMissionStore.getState().articleLikes;
      const currentDislikes = useMissionStore.getState().articleDislikes;
      setArticleLikes(currentLikes + added_likes);
      setArticleDislikes(currentDislikes + added_dislikes);
    },
    [setArticleLikes, setArticleDislikes]
  );

  return {
    // articleLikes, // Get from store where needed
    // articleDislikes, // Get from store where needed
    opinion,
    handleLikeArticle,
    handleDislikeArticle,
    setPredictedReactions,
  };
};

export default useArticleState;
