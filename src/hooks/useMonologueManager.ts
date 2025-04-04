import { useState, useEffect, useRef, useCallback } from "react";
import { useMissionStore } from "../stores/missionStore"; // For mission success check

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
      setMissionResultMonologue(success ? "미션 성공!" : "미션 실패...");
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
      nextMonologue = "미션 데이터를 불러오는 중...";
    } else if (missionError) {
      nextMonologue = `오류: ${missionError}`;
    } else if (missionResultMonologue) {
      // Show mission result first if available
      nextMonologue = missionResultMonologue;
    } else if (wasGenerating && !isGeneratingComments) {
      // Show comment count after generation finishes
      nextMonologue = `댓글이 ${commentsLength}개 달렸군. 어디 읽어볼까... `;
      // Auto-hide after a delay?
      // setTimeout(() => {
      //   // Check if it hasn't been overridden by another state change
      //   if (currentMonologue === nextMonologue) {
      //     setIsMonologueVisible(false);
      //   }
      // }, 4000);
    } else if (isGeneratingComments) {
      // Show AI thinking monologue or a generic waiting message
      nextMonologue = aiMonologue || "잠시 여론을 지켜볼까...?";
    } else if (aiMonologue) {
      // Show specific AI monologue if provided and not generating
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
