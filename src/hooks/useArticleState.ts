import { useState, useEffect, useCallback } from 'react';
import { Opinion } from '../types'; // Opinion 타입 import

interface UseArticleStateResult {
  articleLikes: number;
  articleDislikes: number;
  opinion: Opinion;
  handleLikeArticle: () => void;
  handleDislikeArticle: () => void;
  setPredictedReactions: (added_likes: number, added_dislikes: number) => void; // AI 예측 '추가' 반영 함수로 수정
}

const useArticleState = (
  initialLikes: number = 0,
  initialDislikes: number = 0,
  initialOpinion: Opinion = { positive: 50, negative: 50 }
): UseArticleStateResult => {
  const [articleLikes, setArticleLikes] = useState(initialLikes);
  const [articleDislikes, setArticleDislikes] = useState(initialDislikes);
  const [opinion, setOpinion] = useState<Opinion>(initialOpinion);

  // 초기값이 변경될 때 상태 업데이트 (useMissionData 로딩 완료 후 반영 위함)
  useEffect(() => {
    setArticleLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setArticleDislikes(initialDislikes);
  }, [initialDislikes]);

  useEffect(() => {
    setOpinion(initialOpinion);
  }, [initialOpinion]);


  // 기사 좋아요 핸들러
  const handleLikeArticle = useCallback(() => {
    setArticleLikes(prev => prev + 1);
    // TODO: 필요시 추가 로직 (예: 게임 플래그 변경 등)
  }, []);

  // 기사 싫어요 핸들러
  const handleDislikeArticle = useCallback(() => {
    setArticleDislikes(prev => prev + 1);
    // TODO: 필요시 추가 로직
  }, []);

  // 기사 반응 변경 시 여론 업데이트
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
  }, [articleLikes, articleDislikes, initialOpinion]);

  return {
    articleLikes,
    articleDislikes,
    opinion,
    handleLikeArticle,
    handleDislikeArticle,
    setPredictedReactions: (added_likes: number, added_dislikes: number) => { // 함수 구현 수정: 기존 값에 더하기
      setArticleLikes(prev => prev + added_likes);
      setArticleDislikes(prev => prev + added_dislikes);
    },
  };
};

export default useArticleState;
