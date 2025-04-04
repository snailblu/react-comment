import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Mission, Comment, Opinion } from "../types";

interface UseMissionDataResult {
  missionData: Mission | null; // Keep original structure, translation happens before setting state
  initialComments: Comment[];
  initialOpinion: Opinion;
  initialLikes: number;
  initialDislikes: number;
  initialMonologue: string;
  totalAttempts: number;
  isLoading: boolean;
  error: string | null;
}

const useMissionData = (
  missionId: string | undefined
): UseMissionDataResult => {
  const { t, i18n } = useTranslation("missions"); // Initialize useTranslation with 'missions' namespace

  const [missionData, setMissionData] = useState<Mission | null>(null);
  const [initialComments, setInitialComments] = useState<Comment[]>([]);
  const [initialOpinion, setInitialOpinion] = useState<Opinion>({
    positive: 50,
    negative: 50,
  });
  const [initialLikes, setInitialLikes] = useState(0);
  const [initialDislikes, setInitialDislikes] = useState(0);
  // Use translation key for default monologue
  const [initialMonologue, setInitialMonologue] = useState(
    t("defaultMonologue")
  );
  const [totalAttempts, setTotalAttempts] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to translate mission data
  const translateMissionData = (rawData: Mission): Mission => {
    const translatedData = JSON.parse(JSON.stringify(rawData)); // Deep copy

    // Translate top-level fields
    if (translatedData.title) translatedData.title = t(translatedData.title);
    if (translatedData.nickname)
      translatedData.nickname = t(translatedData.nickname);
    if (translatedData.articleTitle)
      translatedData.articleTitle = t(translatedData.articleTitle);
    if (translatedData.articleContent)
      translatedData.articleContent = t(translatedData.articleContent);
    if (translatedData.initialMonologue)
      translatedData.initialMonologue = t(translatedData.initialMonologue);

    // Translate conditions array
    if (Array.isArray(translatedData.conditions)) {
      translatedData.conditions = translatedData.conditions.map(
        (cond: string) => t(cond)
      );
    }

    // Translate keywords array
    if (Array.isArray(translatedData.keywords)) {
      translatedData.keywords = translatedData.keywords.map((keyword: string) =>
        t(keyword)
      );
    }

    // Translate initialComments
    if (Array.isArray(translatedData.initialComments)) {
      translatedData.initialComments = translatedData.initialComments.map(
        (comment: any) => {
          const translatedComment = { ...comment };
          if (translatedComment.nickname)
            translatedComment.nickname = t(translatedComment.nickname);
          if (translatedComment.content)
            translatedComment.content = t(translatedComment.content);
          return translatedComment;
        }
      );
    }

    return translatedData;
  };

  useEffect(() => {
    if (!missionId) {
      setError(t("errorNoMissionId")); // Use translation key
      setIsLoading(false);
      return;
    }

    const fetchMissionData = async () => {
      console.log(
        `useMissionData: 미션 데이터 로딩 시작... (ID: ${missionId}, 언어: ${i18n.language})`
      );
      setIsLoading(true);
      setError(null);
      try {
        // Electron 환경 호환성을 위해 상대 경로 사용
        const response = await fetch("./missions.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allMissions: Record<string, Mission> = await response.json();
        const rawMissionData = allMissions[missionId];

        if (!rawMissionData) {
          throw new Error(t("errorMissionNotFound", { missionId })); // Use translation key
        }

        // Translate the fetched data
        const translatedMissionData = translateMissionData(rawMissionData);
        // Log translated data before setting state
        console.log(
          "useMissionData: Translated Data:",
          JSON.stringify(translatedMissionData).substring(0, 500) + "..."
        ); // Log first 500 chars

        console.log(
          `useMissionData: Initializing with translated data for mission ${missionId}`,
          translatedMissionData
        );
        setMissionData(translatedMissionData); // Set translated data

        // Set initial states based on translated data
        setInitialOpinion(
          translatedMissionData.initialOpinion ?? { positive: 60, negative: 40 }
        );
        setTotalAttempts(translatedMissionData.totalAttempts ?? 5);
        // Use translated monologue, fallback to default translated monologue
        setInitialMonologue(
          translatedMissionData.initialMonologue ?? t("defaultMonologue")
        );
        setInitialLikes(translatedMissionData.initialLikes ?? 0);
        setInitialDislikes(translatedMissionData.initialDislikes ?? 0);

        // Set initial comments from translated data (already translated in translateMissionData)
        const loadedComments: Comment[] = (
          translatedMissionData.initialComments ?? []
        )
          .filter((c: any) => c.id && c.content && c.created_at) // Ensure required fields exist
          .map(
            (c: any): Comment => ({
              // Map to Comment type, assuming structure matches
              id: c.id!,
              nickname: c.nickname, // Already translated
              ip: c.ip,
              isReply: c.isReply,
              parentId: c.parentId,
              content: c.content!, // Already translated
              likes: c.likes ?? 0,
              is_player: c.is_player ?? false,
              created_at: c.created_at!,
            })
          );
        setInitialComments(loadedComments);
        console.log(
          `useMissionData: 미션 데이터 로딩 및 번역 완료 (ID: ${missionId}, 언어: ${i18n.language})`
        );
      } catch (err) {
        console.error("미션 데이터 로딩/번역 실패:", err);
        const errorMessage =
          err instanceof Error ? err.message : t("errorLoadingFailed"); // Use translation key
        setError(errorMessage);
        setMissionData(null);
        setInitialComments([]);
        setInitialOpinion({ positive: 50, negative: 50 });
        setInitialLikes(0);
        setInitialDislikes(0);
        setInitialMonologue(t("errorLoadingMonologue")); // Use translation key
        setTotalAttempts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissionData();
  }, [missionId, i18n.language, t]); // Add i18n.language and t to dependency array

  return {
    missionData, // Return translated data
    initialComments,
    initialOpinion,
    initialLikes,
    initialDislikes,
    initialMonologue,
    totalAttempts,
    isLoading,
    error,
  };
};

export default useMissionData;
