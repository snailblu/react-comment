import React, { useEffect } from 'react';
// useNavigate 제거 (useStoryProgression 내부에서 사용)
// audioManager 관련 import 제거 (useStoryProgression 내부에서 사용)
import { playBgm, stopBgm } from '../utils/audioManager'; // BGM 관련만 남김
import Background from './Background';
import Character from './Character';
import DialogueBox from './DialogueBox';
import Choices from './Choices';
import SettingsMenu from './SettingsMenu';
import PhoneChat from './PhoneChat';
import useEpisodeLoader from '../hooks/useEpisodeLoader';
import useGameState from '../hooks/useGameState';
import useStoryProgression from '../hooks/useStoryProgression'; // 새로 만든 훅 import
import useStoryUIState from '../hooks/useStoryUIState'; // 새로 만든 훅 import
import StoryMenuBar from './StoryMenuBar'; // 새로 만든 컴포넌트 import
import { getCharacterImageUrl } from '../config/characterSprites'; // 캐릭터 이미지 함수 import
import { ScriptLine } from '../types'; // 필요한 타입만 import
import styles from './StoryScene.module.css';
import roomBackground from '../assets/oneroom.png';
// 캐릭터 이미지 import 제거 (config 파일에서 관리)


const StoryScene: React.FC = () => {
  // --- 커스텀 Hook 사용 ---
  // TODO: 현재는 테스트용 ID 사용. 라우팅 또는 상태 관리 통해 동적으로 받아와야 함.
  // 스크립트 시작 ID로 되돌림 (script.json의 키)
  const episodeIdToLoad = '123e4567-e89b-12d3-a456-426614174000'; // 유효 ID -> 스크립트 시작 ID로 변경
  const { episodeData, isLoadingEpisode } = useEpisodeLoader(episodeIdToLoad);

  // episodeData에서 실제 스크립트 데이터 추출 (intro_dialogues 사용 가정)
  const currentEpisodeScript = episodeData?.intro_dialogues ?? [];

  const {
    currentScriptIndex,
    gameFlags,
    setCurrentScriptIndex,
    setGameFlags,
    saveGame,
    loadGame
  } = useGameState(currentEpisodeScript);

  // UI 상태 훅 호출
  const {
    showSettings,
    setShowSettings,
    notificationMessage,
    // setNotificationMessage, // 알림 설정 로직은 아직 없으므로 주석 처리
    showPhoneChat,
    togglePhoneChat,
  } = useStoryUIState();

  // 스토리 진행 훅 호출
  const { handleNext, handleChoiceSelect } = useStoryProgression({
    currentScript: currentEpisodeScript,
    currentScriptIndex,
    setCurrentScriptIndex,
    gameFlags,
    setGameFlags,
    episodeData, // episodeData 전달
  });

  // --- BGM 자동 재생 시도 및 정리 ---
  useEffect(() => {
    console.log('StoryScene 마운트 - BGM 재생 시도');
    playBgm('mainTheme');

    return () => {
      console.log('StoryScene 언마운트 - BGM 정지');
      stopBgm();
    };
  }, []);

  // --- 로딩 상태 처리 ---
  if (isLoadingEpisode) {
    return <div>Loading episode...</div>;
  }

  // --- 현재 스크립트 라인 결정 ---
  const currentLine: ScriptLine | null = currentEpisodeScript && currentEpisodeScript.length > currentScriptIndex
    ? currentEpisodeScript[currentScriptIndex]
    : null;

  // --- 스크립트 종료 또는 오류 처리 ---
  if (!currentLine) {
    if (currentEpisodeScript.length === 0 && !isLoadingEpisode) {
      return <div>Error: Failed to load episode data or script is empty.</div>;
    }
    // 스크립트 정상 종료 (useStoryProgression 내부에서 navigate 처리)
    // 여기서는 null을 반환하거나 로딩 스피너 등을 표시할 수 있음
    return null; // 또는 <div>Episode ended. Preparing next scene...</div>
  }

  // --- 캐릭터 이미지 URL 결정 ---
  const characterImageUrl = getCharacterImageUrl(currentLine.character, currentLine.expression);

  // --- 조건부 대사 결정 ---
  let dialogueTextToShow = currentLine.text ?? '';
  if (currentLine.condition && gameFlags[currentLine.condition.flag] === currentLine.condition.value) {
    dialogueTextToShow = currentLine.altText || currentLine.text || '';
    console.log(`조건 만족 (${currentLine.condition.flag} === ${currentLine.condition.value}), 대체 텍스트 표시: ${dialogueTextToShow}`);
  }

  // --- 렌더링 ---
  return (
    <div className={styles.storySceneContainer}>
      <div className={styles.storyArea}>
        {/* 메뉴 바 컴포넌트 사용 */}
        <StoryMenuBar
          onSave={saveGame}
          onLoad={loadGame}
          onSettings={() => setShowSettings(true)}
          onTogglePhoneChat={togglePhoneChat}
          isPhoneChatVisible={showPhoneChat}
          isLoading={isLoadingEpisode} // 로딩 상태 전달
        />

        {/* 상단 알림 메시지 */}
        {notificationMessage && (
          <div className={styles.notification}>
            {notificationMessage}
          </div>
        )}

        <Background imageUrl={roomBackground} />

        {/* 캐릭터 표시 */}
        {currentLine.character && currentLine.character !== '나' && currentLine.type !== 'narrator' && characterImageUrl && (
          <Character
            imageUrl={characterImageUrl}
            name={currentLine.character} // non-null assertion 제거 (위에서 체크)
          />
        )}

        {/* 대화 또는 선택지 표시 */}
        {currentLine.type === 'choice' ? (
          <Choices
            choices={currentLine.choices ?? []}
            onChoiceSelect={handleChoiceSelect} // 훅에서 가져온 핸들러 전달
          />
        ) : (
          <DialogueBox
            characterName={currentLine.type === 'narrator' ? null : currentLine.character}
            dialogueText={dialogueTextToShow}
            onNext={handleNext} // 훅에서 가져온 핸들러 전달
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
