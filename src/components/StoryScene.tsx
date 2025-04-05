import React, { useEffect, useCallback } from "react"; // useState 제거
import { useNavigate } from "react-router-dom";
import {
  playBgm,
  stopBgm,
  // playSfx, // 사용하지 않으므로 제거
  signalInteraction,
} from "../utils/audioManager";
import Background from "./Background";
import Character from "./Character";
import DialogueBox from "./DialogueBox";
import Choices from "./Choices";
import SettingsMenu from "./SettingsMenu";
import PhoneChat from "./PhoneChat";
// import useEpisodeLoader from "../hooks/useEpisodeLoader"; // Remove episode loader
import useScriptLoader from "../hooks/useScriptLoader"; // Import script loader
import { useGameState } from "../stores/gameStateStore";
import { useStoryStore } from "../stores/storyStore";
import useStoryUIState from "../hooks/useStoryUIState";
import StoryMenuBar from "./StoryMenuBar";
import { getCharacterImageUrl } from "../config/characterSprites";
import { ScriptLine } from "../types";
import styles from "./StoryScene.module.css";
// import gameStyles from "./StoryScene.module.css"; // 사용하지 않으므로 제거
import roomBackground from "../assets/oneroom.png";

const StoryScene: React.FC = () => {
  // --- Custom Hook 사용 ---
  const { scriptData: allScriptData, isLoadingScript } = useScriptLoader(); // Use script loader
  const navigate = useNavigate();

  // Zustand 스토어 사용
  const { gameFlags, setCurrentScene } = useGameState();
  const {
    scriptData: currentEpisodeScript, // Rename state variable for clarity
    currentDialogueIndex,
    setScriptData,
    advanceDialogue,
  } = useStoryStore();

  // TODO: Get current episode ID dynamically (e.g., from route params or game state)
  const currentEpisodeId = "123e4567-e89b-12d3-a456-426614174000"; // Hardcoded for now

  // Load current episode script into store when allScriptData is loaded/updated
  useEffect(() => {
    // Log received script data from the hook
    console.log(
      "StoryScene: Received allScriptData update:",
      JSON.stringify(allScriptData).substring(0, 300) + "..."
    );
    if (allScriptData && allScriptData[currentEpisodeId]?.intro_dialogues) {
      console.log(
        `StoryScene: Setting script data in store for episode ${currentEpisodeId}`
      );
      setScriptData(allScriptData[currentEpisodeId].intro_dialogues);
    } else if (!isLoadingScript) {
      console.warn(
        `StoryScene: Could not find intro_dialogues for episode ${currentEpisodeId} in loaded script data.`
      );
      // Optionally handle error state here, e.g., navigate back or show error message
    }
    // TODO: Handle loading other script parts (e.g., ending_dialogues) if necessary
  }, [allScriptData, currentEpisodeId, setScriptData, isLoadingScript]);

  // UI 상태 훅 호출 (기존 유지)
  const {
    showSettings,
    setShowSettings,
    notificationMessage,
    // setNotificationMessage,
    showPhoneChat,
    togglePhoneChat,
  } = useStoryUIState();

  // --- New handlers using Zustand store ---
  const handleNextClick = useCallback(() => {
    signalInteraction();
    // playSfx("click");

    const nextSceneType = advanceDialogue();
    const missionId = allScriptData?.[currentEpisodeId]?.mission_id; // Get missionId from loaded data

    if (nextSceneType === "comment" && missionId) {
      console.log("Transitioning to Instagram Scene for mission:", missionId);
      setCurrentScene("instagram");
      navigate(`/instagram/${missionId}`);
    } else if (nextSceneType) {
      console.warn(
        `Unhandled next scene type: ${nextSceneType}. Navigating to title.`
      );
      setCurrentScene("title");
      navigate("/");
    } else if (
      currentEpisodeScript &&
      currentDialogueIndex >= currentEpisodeScript.length - 1
    ) {
      console.log("End of script reached. Navigating to title.");
      setCurrentScene("title");
      navigate("/");
    }
  }, [
    advanceDialogue,
    navigate,
    allScriptData,
    currentEpisodeId,
    setCurrentScene,
    currentEpisodeScript,
    currentDialogueIndex,
  ]);

  const handleChoiceClick = useCallback(
    (choiceId: string | number) => {
      signalInteraction();
      // playSfx("click");

      const currentLine = currentEpisodeScript?.[currentDialogueIndex];
      const selectedChoice = currentLine?.choices?.find(
        (c) => c.id === choiceId
      );

      if (!selectedChoice) {
        console.error(`Could not find choice with id: ${choiceId}`);
        return;
      }

      const nextSceneType = advanceDialogue(selectedChoice);
      const missionId = allScriptData?.[currentEpisodeId]?.mission_id;

      if (nextSceneType === "comment" && missionId) {
        console.log(
          "Transitioning to Instagram Scene after choice for mission:",
          missionId
        );
        setCurrentScene("instagram");
        navigate(`/instagram/${missionId}`);
      } else if (nextSceneType) {
        console.warn(
          `Unhandled next scene type after choice: ${nextSceneType}. Navigating to title.`
        );
        setCurrentScene("title");
        navigate("/");
      } else if (
        currentEpisodeScript &&
        currentDialogueIndex >= currentEpisodeScript.length - 1
      ) {
        console.log("End of script reached after choice. Navigating to title.");
        setCurrentScene("title");
        navigate("/");
      }
    },
    [
      advanceDialogue,
      navigate,
      allScriptData,
      currentEpisodeId,
      setCurrentScene,
      currentEpisodeScript,
      currentDialogueIndex,
    ]
  );

  // --- BGM 자동 재생 시도 및 정리 ---
  useEffect(() => {
    console.log("StoryScene 마운트 - tenseTheme BGM 재생 시도");
    playBgm("tenseTheme");

    return () => {
      console.log("StoryScene 언마운트 - BGM 정지");
      stopBgm();
    };
  }, []);

  // --- 로딩 상태 처리 ---
  if (isLoadingScript) {
    return <div>Loading script...</div>;
  }

  // --- 현재 스크립트 라인 결정 (Zustand 스토어 사용) ---
  const currentLine: ScriptLine | null =
    currentEpisodeScript && currentEpisodeScript.length > currentDialogueIndex
      ? currentEpisodeScript[currentDialogueIndex]
      : null;

  // --- 스크립트 종료 또는 오류 처리 ---
  if (!currentLine) {
    if (
      !isLoadingScript &&
      (!currentEpisodeScript || currentEpisodeScript.length === 0)
    ) {
      return (
        <div>
          Error: Failed to load script data for this episode or script is empty.
        </div>
      );
    }
    return null;
  }

  // --- 캐릭터 이미지 URL 결정 ---
  const characterImageUrl = getCharacterImageUrl(
    currentLine.character,
    currentLine.expression
  );

  // --- 조건부 대사 결정 ---
  let dialogueTextToShow = currentLine.text ?? "";
  if (
    currentLine.condition &&
    gameFlags[currentLine.condition.flag] === currentLine.condition.value
  ) {
    dialogueTextToShow = currentLine.altText || currentLine.text || "";
  }
  // Log the text being passed to DialogueBox
  console.log(
    "StoryScene: Passing dialogue text to DialogueBox:",
    dialogueTextToShow
  );

  // --- 렌더링 ---
  return (
    <div className={styles.storySceneContainer}>
      <div className={styles.storyArea}>
        <StoryMenuBar
          onSave={() => console.log("Save Game - Not implemented yet")}
          onLoad={() => console.log("Load Game - Not implemented yet")}
          onSettings={() => setShowSettings(true)}
          onTogglePhoneChat={togglePhoneChat}
          isPhoneChatVisible={showPhoneChat}
          isLoading={isLoadingScript}
        />

        {notificationMessage && (
          <div className={styles.notification}>{notificationMessage}</div>
        )}

        <Background imageUrl={currentLine.background || roomBackground} />

        {currentLine.character &&
          currentLine.character !== "나" &&
          currentLine.type !== "narrator" &&
          characterImageUrl &&
          characterImageUrl !== "/default_profile_icon.png" && (
            <Character
              imageUrl={characterImageUrl}
              name={currentLine.character}
            />
          )}

        {currentLine.type === "choice" ? (
          <Choices
            choices={currentLine.choices ?? []}
            onChoiceSelect={(choiceId) => handleChoiceClick(choiceId)}
          />
        ) : (
          <DialogueBox
            characterName={
              currentLine.type === "narrator" ? null : currentLine.character
            }
            dialogueText={dialogueTextToShow}
            onNext={handleNextClick}
          />
        )}

        {showPhoneChat && <PhoneChat />}
      </div>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default StoryScene;
