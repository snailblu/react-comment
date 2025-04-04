import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { useMissionStore } from "../stores/missionStore";

interface UseMonologueManagerProps {
  isMissionLoading: boolean;
  missionError: string | null;
  initialMonologue: string | undefined | null;
  isGeneratingComments: boolean;
  aiMonologue: string | null;
  isMissionOver: boolean;
  commentsLength: number;
  // missionSuccess: boolean | null; // Pass the success status directly if available elsewhere
}

const useMonologueManager = ({
  isMissionLoading,
  missionError,
  initialMonologue,
  isGeneratingComments,
  aiMonologue,
  isMissionOver,
  commentsLength,
}: // missionSuccess,
UseMonologueManagerProps) => {
  const { t } = useTranslation("monologues"); // Initialize useTranslation
  const [currentMonologue, setCurrentMonologue] = useState<string>("");
  const [isMonologueVisible, setIsMonologueVisible] = useState(true);
  const [missionResultMonologue, setMissionResultMonologue] = useState("");
  const prevIsGeneratingCommentsRef = useRef<boolean>(isGeneratingComments);
  const checkMissionCompletion = useMissionStore(
    (state) => state.checkMissionCompletion
  ); // Get the check function

  // Determine mission result monologue when mission is over
  useEffect(() => {
    if (isMissionOver) {
      const success = checkMissionCompletion(); // Check completion status
      // Use translation keys for mission result
      setMissionResultMonologue(
        success ? t("missionSuccess") : t("missionFail")
      );
      // Optionally hide monologue after a delay?
      // const timer = setTimeout(() => setIsMonologueVisible(false), 3000);
      // return () => clearTimeout(timer);
    } else {
      setMissionResultMonologue(""); // Reset when not over
    }
  }, [isMissionOver, checkMissionCompletion]);

  // Update current monologue based on various states
  useEffect(() => {
    const wasGenerating = prevIsGeneratingCommentsRef.current;
    prevIsGeneratingCommentsRef.current = isGeneratingComments;

    let nextMonologue = "";

    if (isMissionLoading) {
      nextMonologue = t("loadingMission"); // Use translation key
    } else if (missionError) {
      // Assuming missionError might be translated already, or use a generic error key
      nextMonologue = t("errorPrefix", { error: missionError }); // Use translation key with interpolation
    } else if (missionResultMonologue) {
      // Show mission result first if available
      nextMonologue = missionResultMonologue;
    } else if (wasGenerating && !isGeneratingComments) {
      // Show comment count after generation finishes using translation key with count
      nextMonologue = t("commentCount", { count: commentsLength });
      // Auto-hide after a delay?
      // setTimeout(() => {
      //   // Check if it hasn't been overridden by another state change
      //   if (currentMonologue === nextMonologue) {
      //     setIsMonologueVisible(false);
      //   }
      // }, 4000);
    } else if (isGeneratingComments) {
      // Show AI thinking monologue or a generic waiting message
      // Use translation key for default waiting message
      nextMonologue = aiMonologue || t("waitingForAI");
    } else if (aiMonologue) {
      // Show specific AI monologue if provided and not generating
      // Assuming aiMonologue might be a key or already translated text
      // If it's a key, wrap with t(), otherwise use directly.
      // For now, assume it might be direct text or already handled.
      nextMonologue = aiMonologue;
    } else {
      // Default to initial monologue
      nextMonologue = initialMonologue ?? "";
    }

    setCurrentMonologue(nextMonologue);
    // Make monologue visible when its content changes, unless it's empty or mission result is being shown briefly
    if (nextMonologue && !missionResultMonologue) {
      // Don't auto-show for mission result, let the component decide
      setIsMonologueVisible(true);
    } else if (!nextMonologue) {
      setIsMonologueVisible(false); // Hide if empty
    }
  }, [
    isMissionLoading,
    missionError,
    missionResultMonologue,
    aiMonologue,
    initialMonologue,
    isGeneratingComments,
    commentsLength,
    // currentMonologue // Avoid self-dependency loop if using setTimeout
  ]);

  const toggleMonologueVisibility = useCallback(() => {
    setIsMonologueVisible((prev) => !prev);
  }, []);

  return {
    currentMonologue,
    isMonologueVisible,
    toggleMonologueVisibility,
  };
};

export default useMonologueManager;
