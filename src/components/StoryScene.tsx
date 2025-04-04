import React, { useEffect, useCallback } from "react"; // useCallback 추가
import { useNavigate } from "react-router-dom"; // useNavigate 다시 추가
import {
  playBgm,
  stopBgm,
  playSfx,
  signalInteraction,
} from "../utils/audioManager"; // 오디오 함수 다시 추가
import Background from "./Background";
import Character from "./Character";
import DialogueBox from "./DialogueBox";
import Choices from "./Choices";
import SettingsMenu from "./SettingsMenu";
import PhoneChat from "./PhoneChat";
// import useEpisodeLoader from "../hooks/useEpisodeLoader"; // Remove episode loader
import useScriptLoader from "../hooks/useScriptLoader"; // Import script loader
// import useGameState from '../hooks/useGameState'; // 제거
// import useStoryProgression from '../hooks/useStoryProgression'; // 제거
import { useGameState } from "../stores/gameStateStore"; // Zustand 스토어 import
import { useStoryStore } from "../stores/storyStore"; // Zustand 스토어 import
import useStoryUIState from "../hooks/useStoryUIState";
import StoryMenuBar from "./StoryMenuBar";
import { getCharacterImageUrl } from "../config/characterSprites";
import { ScriptLine } from "../types"; // Choice 타입 추가
import styles from "./StoryScene.module.css";
import roomBackground from "../assets/oneroom.png";
// 캐릭터 이미지 import 제거 (config 파일에서 관리)

const StoryScene: React.FC = () => {
  // --- 커스텀 Hook 사용 ---
  const { scriptData: allScriptData, isLoadingScript } = useScriptLoader(); // Use script loader
  const navigate = useNavigate();

  // Zustand 스토어 사용
  const { gameFlags, setCurrentScene } = useGameState(); // setGameFlag 추가, setCurrentScene 추가
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
    console.log(
      "StoryScene: allScriptData updated:",
      JSON.stringify(allScriptData).substring(0, 300) + "..."
    ); // Log received script data
    if (allScriptData && allScriptData[currentEpisodeId]?.intro_dialogues) {
      console.log(
        `StoryScene: Setting script data for episode ${currentEpisodeId}`
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
    // setNotificationMessage, // 알림 설정 로직은 아직 없으므로 주석 처리
    showPhoneChat,
    togglePhoneChat,
  } = useStoryUIState();

  // --- New handlers using Zustand store ---
  const handleNextClick = useCallback(() => {
    signalInteraction();
    // playSfx("click"); // 클릭 효과음 제거

    const nextSceneType = advanceDialogue(); // Call store action
    const missionId = allScriptData?.[currentEpisodeId]?.mission_id; // Get missionId from loaded data

    if (nextSceneType === "comment" && missionId) {
      // Keep "comment" check if advanceDialogue returns this string
      console.log(
        "Transitioning to Instagram Scene for mission:", // Log message updated
        missionId
      );
      setCurrentScene("instagram"); // Update global scene state to "instagram"
      navigate(`/instagram/${missionId}`); // Navigate to Instagram scene
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
      // Use currentEpisodeScript
      // End of script and no scene transition defined
      console.log("End of script reached. Navigating to title.");
      setCurrentScene("title");
      navigate("/");
    }
    // If nextSceneType is null and not end of script, advanceDialogue already updated the index.
  }, [
    advanceDialogue,
    navigate,
    allScriptData, // Use allScriptData to get missionId
    currentEpisodeId,
    setCurrentScene,
    currentEpisodeScript, // Use currentEpisodeScript
    currentDialogueIndex,
  ]);

  // Modified to accept choiceId and find the choice object
  const handleChoiceClick = useCallback(
    (choiceId: string | number) => {
      signalInteraction();
      // playSfx("click"); // 클릭 효과음 제거

      // Find the selected choice object from the current line's choices
      const currentLine = currentEpisodeScript?.[currentDialogueIndex]; // Use currentEpisodeScript
      const selectedChoice = currentLine?.choices?.find(
        (c) => c.id === choiceId
      ); // Use optional chaining and find

      if (!selectedChoice) {
        console.error(`Could not find choice with id: ${choiceId}`);
        return; // Exit if choice not found
      }

      // Pass the found choice object to the store action
      const nextSceneType = advanceDialogue(selectedChoice); // Pass the found object
      const missionId = allScriptData?.[currentEpisodeId]?.mission_id; // Get missionId

      if (nextSceneType === "comment" && missionId) {
        // Keep "comment" check if advanceDialogue returns this string
        console.log(
          "Transitioning to Instagram Scene after choice for mission:", // Log message updated
          missionId
        );
        setCurrentScene("instagram"); // Update global scene state to "instagram"
        navigate(`/instagram/${missionId}`); // Navigate to Instagram scene
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
        // Use currentEpisodeScript
        // End of script and no scene transition defined after choice processing
        console.log("End of script reached after choice. Navigating to title.");
        setCurrentScene("title");
        navigate("/");
      }
      // If nextSceneType is null and not end of script, advanceDialogue already updated the index.
    },
    [
      advanceDialogue,
      navigate,
      allScriptData, // Use allScriptData to get missionId
      currentEpisodeId,
      setCurrentScene,
      currentEpisodeScript, // Use currentEpisodeScript
      currentDialogueIndex,
    ]
  );

  // --- BGM 자동 재생 시도 및 정리 ---
  useEffect(() => {
    console.log("StoryScene 마운트 - tenseTheme BGM 재생 시도");
    playBgm("tenseTheme"); // BGM 키를 "tenseTheme"으로 변경

    return () => {
      console.log("StoryScene 언마운트 - BGM 정지");
      stopBgm();
    };
  }, []);

  // --- 로딩 상태 처리 ---
  if (isLoadingScript) {
    // Use isLoadingScript from useScriptLoader
    return <div>Loading script...</div>; // Update loading message
  }

  // --- 현재 스크립트 라인 결정 (Zustand 스토어 사용) ---
  const currentLine: ScriptLine | null =
    currentEpisodeScript && currentEpisodeScript.length > currentDialogueIndex // Use currentEpisodeScript
      ? currentEpisodeScript[currentDialogueIndex]
      : null;

  // --- 스크립트 종료 또는 오류 처리 ---
  if (!currentLine) {
    // Handle cases where currentEpisodeScript is null, empty, or index is out of bounds
    if (
      !isLoadingScript &&
      (!currentEpisodeScript || currentEpisodeScript.length === 0)
    ) {
      // Use currentEpisodeScript
      // Changed condition to check currentEpisodeScript from store
      return (
        <div>
          Error: Failed to load script data for this episode or script is empty.
        </div>
      ); // Update error message
    }
    // If loading or script ended (handled by advanceDialogue), show nothing or loading indicator
    return null;
  }

  // --- 캐릭터 이미지 URL 결정 --- (기존 로직 유지, currentLine 사용)
  const characterImageUrl = getCharacterImageUrl(
    currentLine.character,
    currentLine.expression
  );

  // --- 조건부 대사 결정 (Zustand 스토어의 gameFlags 사용) ---
  let dialogueTextToShow = currentLine.text ?? "";
  if (
    currentLine.condition &&
    gameFlags[currentLine.condition.flag] === currentLine.condition.value
  ) {
    dialogueTextToShow = currentLine.altText || currentLine.text || "";
    // console.log(`조건 만족 (${currentLine.condition.flag} === ${currentLine.condition.value}), 대체 텍스트 표시: ${dialogueTextToShow}`); // 로그 레벨 조정 가능
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
        {/* 메뉴 바 컴포넌트 사용 */}
        <StoryMenuBar
          onSave={() => console.log("Save Game - Not implemented yet")} // 임시 처리
          onLoad={() => console.log("Load Game - Not implemented yet")} // 임시 처리
          onSettings={() => setShowSettings(true)}
          onTogglePhoneChat={togglePhoneChat}
          isPhoneChatVisible={showPhoneChat}
          isLoading={isLoadingScript} // Pass isLoadingScript
        />

        {/* 상단 알림 메시지 */}
        {notificationMessage && (
          <div className={styles.notification}>{notificationMessage}</div>
        )}

        {/* 배경 표시 (currentLine.background 우선, 없으면 roomBackground 사용) */}
        <Background imageUrl={currentLine.background || roomBackground} />

        {/* 캐릭터 표시 (기본 아이콘 경로가 아닐 때만 렌더링) */}
        {currentLine.character &&
          currentLine.character !== "나" &&
          currentLine.type !== "narrator" &&
          characterImageUrl &&
          characterImageUrl !== "/default_profile_icon.png" && ( // 기본 아이콘 경로 체크 추가
            <Character
              imageUrl={characterImageUrl}
              name={currentLine.character} // non-null assertion 제거 (위에서 체크)
            />
          )}

        {/* 대화 또는 선택지 표시 */}
        {currentLine.type === "choice" ? (
          <Choices
            choices={currentLine.choices ?? []}
            // onChoiceSelect expects (choiceId, nextId), but our handler takes the choice object.
            // Pass only the choiceId to the handler, as expected by Choices component
            onChoiceSelect={(choiceId) => handleChoiceClick(choiceId)}
          />
        ) : (
          <DialogueBox
            characterName={
              currentLine.type === "narrator" ? null : currentLine.character
            }
            dialogueText={dialogueTextToShow}
            onNext={handleNextClick} // Use new handler
          />
        )}

        {/* PhoneChat 컴포넌트 조건부 렌더링 */}
        {showPhoneChat && <PhoneChat />}
      </div>

      {/* 설정 메뉴 조건부 렌더링 */}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default StoryScene;
