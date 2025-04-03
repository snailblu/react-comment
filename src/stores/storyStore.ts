import { create } from "zustand";
import { ScriptData, ScriptLine, ChoiceOption } from "../types"; // Change Choice to ChoiceOption
import { useGameState } from "./gameStateStore"; // Import gameStateStore to update flags

interface StoryState {
  currentStoryId: string | number | null; // ID can be string or number based on ScriptLine
  scriptData: ScriptData | null;
  currentDialogueIndex: number;
  // TODO: 스토리 진행 관련 추가 상태 정의
}

interface StoryActions {
  setScriptData: (data: ScriptData) => void;
  advanceStory: (nextStoryId: string) => void; // Keep for potential episode/chapter changes
  setCurrentDialogueIndex: (index: number) => void;
  advanceDialogue: (choice?: ChoiceOption) => string | null; // Change parameter type to ChoiceOption
  // TODO: 스토리 진행 관련 추가 액션 정의
}

// Helper to find script index by ID
const findScriptIndexById = (
  targetId: string | number | undefined,
  script: ScriptLine[]
): number => {
  if (targetId === undefined || targetId === null) return -1;
  return script.findIndex((line) => line.id === targetId);
};

export const useStoryStore = create<StoryState & StoryActions>((set, get) => ({
  currentStoryId: null,
  scriptData: null,
  currentDialogueIndex: 0,
  // TODO: 추가 상태 초기값 설정

  setScriptData: (data) =>
    set({
      scriptData: data,
      // Use the ID of the first script line as the initial story ID
      currentStoryId: data?.[0]?.id || null, // Assuming scriptData is ScriptLine[]
      currentDialogueIndex: 0,
    }),
  advanceStory: (nextStoryId) =>
    set((state) => {
      // TODO: Add logic to potentially update scriptData if needed based on nextStoryId
      // Ensure nextStoryId type matches currentStoryId type possibility
      console.warn(
        "advanceStory action needs implementation if used for episode/chapter changes."
      );
      return {
        currentStoryId: nextStoryId as string | number,
        currentDialogueIndex: 0,
      };
    }),
  setCurrentDialogueIndex: (index) => set({ currentDialogueIndex: index }),

  advanceDialogue: (choice) => {
    const { scriptData, currentDialogueIndex } = get();
    const { setGameFlag } = useGameState.getState(); // Get flag setter from gameStateStore

    if (!scriptData || currentDialogueIndex >= scriptData.length) {
      console.error("Cannot advance dialogue: Invalid script data or index.");
      return null; // Indicate no scene change, possibly end of script
    }

    const currentLine = scriptData[currentDialogueIndex];
    let nextIndex = -1;
    let nextSceneType: string | null = null;

    if (choice) {
      // --- Handle Choice ---
      // Update game flag for the choice made
      if (choice.text) {
        // Use choice text or a unique ID if available
        setGameFlag(`choice_${currentLine.id}`, choice.text); // Example flag
      }
      // Find next index based on choice's nextId (using ChoiceOption type)
      nextIndex = findScriptIndexById(choice.nextId, scriptData);
      if (nextIndex !== -1) {
        nextSceneType = scriptData[nextIndex]?.nextScene || null;
      } else {
        console.warn(
          `Next script line not found for choice: ${choice.text} (nextId: ${choice.nextId})`
        );
        // Fallback: try moving to the next line sequentially? Or end?
        // For now, let's just warn and potentially end by returning null.
        return null;
      }
    } else if (currentLine.type !== "choice") {
      // --- Handle Next (Not a choice line) ---
      nextSceneType = currentLine.nextScene || null;
      if (nextSceneType) {
        // Scene transition is handled by the component based on the return value
      } else {
        // Find next index based on current line's nextId
        nextIndex = findScriptIndexById(currentLine.nextId, scriptData);
        // If no nextId or not found, try sequential next line
        if (nextIndex === -1 && currentDialogueIndex < scriptData.length - 1) {
          nextIndex = currentDialogueIndex + 1;
          nextSceneType = scriptData[nextIndex]?.nextScene || null;
        }
      }
    } else {
      // Current line is a choice, but no choice was provided - do nothing?
      console.warn("advanceDialogue called on a choice line without a choice.");
      return null;
    }

    // Update state if a valid next index is found
    if (nextIndex !== -1) {
      set({ currentDialogueIndex: nextIndex });
    } else if (!nextSceneType) {
      // No next index found and no scene transition -> End of script?
      console.log("End of script reached or next line not found.");
      // Optionally set a flag or specific state indicating script end
      return null; // Indicate no scene change / end
    }

    // Return the type of the next scene if a transition is needed
    return nextSceneType;
  },
  // TODO: 추가 액션 구현
}));
