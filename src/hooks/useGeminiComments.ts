import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import {
  generateAiComments,
  ParsedAiResponse,
} from "../services/geminiService";
import {
  Comment,
  ArticleReactions as ArticleReactionsType,
  Mission,
} from "../types";

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
  const { t, i18n } = useTranslation("geminiComments"); // Initialize useTranslation
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  const [aiMonologue, setAiMonologue] = useState("");

  const triggerGenerateComments = useCallback(
    async (
      missionData: Mission,
      currentComments: Comment[],
      currentReactions: ArticleReactionsType
    ): Promise<ParsedAiResponse> => {
      const currentLanguage = i18n.language; // Get current language

      if (isGeneratingComments || !missionData) {
        const errorKey = isGeneratingComments
          ? "errorAlreadyGenerating"
          : "errorNoMissionData";
        return Promise.resolve({
          generatedComments: [],
          predictedAddedReactions: null,
          error: t(errorKey),
        });
      }

      setIsGeneratingComments(true);
      setAiMonologue(t("generating")); // Use translation key for loading message

      // Pass currentLanguage to generateAiComments
      const result = await generateAiComments(
        missionData,
        currentComments,
        currentReactions,
        currentLanguage
      );

      if (result.error) {
        // Assuming result.error might be a key or already translated
        setAiMonologue(result.error);
      } else if (
        result.generatedComments.length === 0 &&
        !result.predictedAddedReactions
      ) {
        setAiMonologue(t("noCommentsOrPredictions")); // Use translation key
      } else {
        let successMsg = "";
        if (result.generatedComments.length > 0) {
          // Use translation key with count for comments generated
          successMsg += t("commentsGenerated", {
            count: result.generatedComments.length,
          });
        } else {
          successMsg += t("noNewComments"); // Use translation key
        }
        if (result.predictedAddedReactions) {
          // Use translation key with interpolation for predictions
          successMsg += ` (${t("predictionInfo", {
            likes: result.predictedAddedReactions.added_likes,
            dislikes: result.predictedAddedReactions.added_dislikes,
          })})`;
        }
        setAiMonologue(successMsg);
      }

      setIsGeneratingComments(false);
      return result;
    },
    [isGeneratingComments, i18n.language, t] // Add i18n.language and t to dependencies
  );

  return {
    isGeneratingComments,
    aiMonologue,
    triggerGenerateComments,
  };
};

export default useGeminiComments;
