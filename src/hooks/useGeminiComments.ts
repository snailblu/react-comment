import { useState, useCallback } from 'react';
import { generateAiComments } from '../services/geminiService'; // 분리된 서비스 import
import { Comment, ArticleReactions as ArticleReactionsType, Mission } from '../types';

interface UseGeminiCommentsResult {
  isGeneratingComments: boolean;
  aiMonologue: string; // 훅 내부의 독백 상태 (기존 monologue와 구분)
  triggerGenerateComments: (
    missionData: Mission,
    currentComments: Comment[],
    currentReactions: ArticleReactionsType
  ) => Promise<{ generatedComments: Comment[]; predictedReactions: ArticleReactionsType | null; error?: string }>; // 결과를 Promise로 반환
}

const useGeminiComments = (): UseGeminiCommentsResult => {
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  const [aiMonologue, setAiMonologue] = useState(''); // AI 관련 독백 상태

  const triggerGenerateComments = useCallback(
    async (
      missionData: Mission,
      currentComments: Comment[],
      currentReactions: ArticleReactionsType
    ): Promise<{ generatedComments: Comment[]; predictedReactions: ArticleReactionsType | null; error?: string }> => {
      if (isGeneratingComments || !missionData) {
        // 이미 생성 중이거나 미션 데이터가 없으면 중단하고 빈 결과 반환
        return { generatedComments: [], predictedReactions: null, error: isGeneratingComments ? "이미 생성 중입니다." : "미션 데이터가 없습니다." };
      }

      setIsGeneratingComments(true);
      setAiMonologue('잠시 여론을 지켜볼까…?'); // 로딩 시작 메시지

      const result = await generateAiComments(missionData, currentComments, currentReactions);

      if (result.error) {
        setAiMonologue(result.error); // 서비스에서 반환된 오류 메시지 사용
      } else if (result.generatedComments.length === 0 && !result.predictedReactions) {
        setAiMonologue('AI가 댓글이나 추천/비추천 예측을 생성하지 못했습니다.');
      } else {
        let successMsg = '';
        if (result.generatedComments.length > 0) {
          successMsg += `AI가 ${result.generatedComments.length}개의 댓글(대댓글 포함)을 생성했습니다.`;
        } else {
          successMsg += 'AI가 새 댓글은 생성하지 않았습니다.';
        }
        if (result.predictedReactions) {
          successMsg += ` (AI 예상 추천/비추천: ${result.predictedReactions.likes}/${result.predictedReactions.dislikes})`;
        }
        setAiMonologue(successMsg);
      }

      setIsGeneratingComments(false);
      return result; // 생성된 댓글, 예측 반응, 오류 메시지 반환
    },
    [isGeneratingComments] // isGeneratingComments만 의존성으로 포함
  );

  return {
    isGeneratingComments,
    aiMonologue,
    triggerGenerateComments,
  };
};

export default useGeminiComments;
