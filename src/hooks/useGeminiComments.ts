import { useState, useCallback } from 'react';
import { generateAiComments, ParsedAiResponse } from '../services/geminiService'; // ParsedAiResponse import 추가
// PredictedAddedReactions 타입은 geminiService에서 반환되므로 여기서 직접 참조할 필요는 없음
import { Comment, ArticleReactions as ArticleReactionsType, Mission } from '../types';

// useGeminiComments 훅의 반환 타입 정의
interface UseGeminiCommentsResult {
  isGeneratingComments: boolean;
  aiMonologue: string; // 훅 내부의 독백 상태 (기존 monologue와 구분)
  triggerGenerateComments: (
    missionData: Mission,
    currentComments: Comment[],
    currentReactions: ArticleReactionsType
  // 반환 타입을 명시적으로 Promise<ParsedAiResponse>로 지정
  ) => Promise<ParsedAiResponse>;
}

const useGeminiComments = (): UseGeminiCommentsResult => {
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  const [aiMonologue, setAiMonologue] = useState(''); // AI 관련 독백 상태

  const triggerGenerateComments = useCallback(
    async (
      missionData: Mission,
      currentComments: Comment[],
      currentReactions: ArticleReactionsType
    // 반환 타입을 명시적으로 Promise<ParsedAiResponse>로 지정
    ): Promise<ParsedAiResponse> => {
      if (isGeneratingComments || !missionData) {
        // 이미 생성 중이거나 미션 데이터가 없으면 중단하고 빈 결과 반환 (타입 일치)
        return Promise.resolve({ generatedComments: [], predictedAddedReactions: null, error: isGeneratingComments ? "이미 생성 중입니다." : "미션 데이터가 없습니다." });
      }

      setIsGeneratingComments(true);
      setAiMonologue('잠시 여론을 지켜볼까…?'); // 로딩 시작 메시지

      // generateAiComments는 이미 Promise를 반환하므로 await만 사용
      const result = await generateAiComments(missionData, currentComments, currentReactions);

      if (result.error) {
        setAiMonologue(result.error); // 서비스에서 반환된 오류 메시지 사용
      // 조건 변경: predictedAddedReactions 확인
      } else if (result.generatedComments.length === 0 && !result.predictedAddedReactions) {
        setAiMonologue('AI가 댓글이나 추가 추천/비추천 예측을 생성하지 못했습니다.'); // 메시지 변경
      } else {
        let successMsg = '';
        if (result.generatedComments.length > 0) {
          successMsg += `AI가 ${result.generatedComments.length}개의 댓글(대댓글 포함)을 생성했습니다.`;
        } else {
          successMsg += 'AI가 새 댓글은 생성하지 않았습니다.';
        }
        // 성공 메시지 변경: predictedAddedReactions 사용
        if (result.predictedAddedReactions) {
          successMsg += ` (AI 예상 추가 추천/비추천: +${result.predictedAddedReactions.added_likes}/+${result.predictedAddedReactions.added_dislikes})`;
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
