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
import useEpisodeLoader from "../hooks/useEpisodeLoader";
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
  // TODO: 현재는 테스트용 ID 사용. 라우팅 또는 상태 관리 통해 동적으로 받아와야 함.
  // 스크립트 시작 ID로 되돌림 (script.json의 키)
  const episodeIdToLoad = "123e4567-e89b-12d3-a456-426614174000"; // 유효 ID -> 스크립트 시작 ID로 변경
  const { episodeData, isLoadingEpisode } = useEpisodeLoader(episodeIdToLoad);
  const navigate = useNavigate(); // useNavigate 훅 사용

  // Zustand 스토어 사용
  const { gameFlags, setCurrentScene } = useGameState(); // setGameFlag 추가, setCurrentScene 추가
  const { scriptData, currentDialogueIndex, setScriptData, advanceDialogue } =
    useStoryStore(); // setScriptData 추가

  // Load script data into store when episodeData is loaded
  useEffect(() => {
    if (episodeData?.intro_dialogues) {
      setScriptData(episodeData.intro_dialogues);
    }
    // TODO: Handle loading other script parts (e.g., ending_dialogues) if necessary
  }, [episodeData, setScriptData]);

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

    if (nextSceneType === "comment" && episodeData?.mission_id) {
      // Keep "comment" check if advanceDialogue returns this string
      console.log(
        "Transitioning to Instagram Scene for mission:", // Log message updated
        episodeData.mission_id
      );
      setCurrentScene("instagram"); // Update global scene state to "instagram"
      navigate(`/instagram/${episodeData.mission_id}`); // Navigate to Instagram scene
    } else if (nextSceneType) {
      console.warn(
        `Unhandled next scene type: ${nextSceneType}. Navigating to title.`
      );
      setCurrentScene("title");
      navigate("/");
    } else if (scriptData && currentDialogueIndex >= scriptData.length - 1) {
      // End of script and no scene transition defined
      console.log("End of script reached. Navigating to title.");
      setCurrentScene("title");
      navigate("/");
    }
    // If nextSceneType is null and not end of script, advanceDialogue already updated the index.
  }, [
    advanceDialogue,
    navigate,
    episodeData,
    setCurrentScene,
    scriptData,
    currentDialogueIndex,
  ]);

  // Modified to accept choiceId and find the choice object
  const handleChoiceClick = useCallback(
    (choiceId: string | number) => {
      signalInteraction();
      // playSfx("click"); // 클릭 효과음 제거

      // Find the selected choice object from the current line's choices
      const currentLine = scriptData?.[currentDialogueIndex];
      const selectedChoice = currentLine?.choices?.find(
        (c) => c.id === choiceId
      ); // Use optional chaining and find

      if (!selectedChoice) {
        console.error(`Could not find choice with id: ${choiceId}`);
        return; // Exit if choice not found
      }

      // Pass the found choice object to the store action
      const nextSceneType = advanceDialogue(selectedChoice); // Pass the found object

      if (nextSceneType === "comment" && episodeData?.mission_id) {
        // Keep "comment" check if advanceDialogue returns this string
        console.log(
          "Transitioning to Instagram Scene after choice for mission:", // Log message updated
          episodeData.mission_id
        );
        setCurrentScene("instagram"); // Update global scene state to "instagram"
        navigate(`/instagram/${episodeData.mission_id}`); // Navigate to Instagram scene
      } else if (nextSceneType) {
        console.warn(
          `Unhandled next scene type after choice: ${nextSceneType}. Navigating to title.`
        );
        setCurrentScene("title");
        navigate("/");
      } else if (scriptData && currentDialogueIndex >= scriptData.length - 1) {
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
      episodeData,
      setCurrentScene,
      scriptData,
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
  if (isLoadingEpisode) {
    return <div>Loading episode...</div>;
  }

  // --- 현재 스크립트 라인 결정 (Zustand 스토어 사용) ---
  const currentLine: ScriptLine | null =
    scriptData && scriptData.length > currentDialogueIndex
      ? scriptData[currentDialogueIndex]
      : null;

  // --- 스크립트 종료 또는 오류 처리 ---
  if (!currentLine) {
    // Handle cases where scriptData is null, empty, or index is out of bounds
    if (!isLoadingEpisode && (!scriptData || scriptData.length === 0)) {
      // Changed condition to check scriptData from store
      return <div>Error: Failed to load script data or script is empty.</div>;
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
          isLoading={isLoadingEpisode} // 로딩 상태 전달
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
