import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate import 추가
// audioManager 함수 import 수정
import { playBgm, stopBgm, playSfx, signalInteraction } from '../utils/audioManager';
import Background from './Background';
import Character from './Character';
import DialogueBox from './DialogueBox';
import Choices from './Choices';
import SettingsMenu from './SettingsMenu'; // SettingsMenu import 추가
import PhoneChat from './PhoneChat'; // PhoneChat 컴포넌트 추가
// import useScriptLoader from '../hooks/useScriptLoader'; // useScriptLoader 훅 import 제거
import useEpisodeLoader from '../hooks/useEpisodeLoader'; // useEpisodeLoader 훅 import 추가
// useGameState 훅 및 관련 타입 import
import useGameState, { ScriptLine, GameFlags, ChoiceOption } from '../hooks/useGameState'; // ScriptData 제거 (이제 EpisodeData 사용)
import styles from './Game.module.css'; // CSS 모듈 import 확인
import roomBackground from '../assets/oneroom.png';
import dorimSmile from '../assets/dorim_smile.png';
import dorimSad from '../assets/dorim_sad.png';
// unmuteAfterInteraction import 제거

// 캐릭터 스프라이트 타입 정의
interface CharacterSpriteMap {
  [characterName: string]: {
    [expression: string]: string; // expression은 문자열 키, 값은 이미지 경로(string)
  };
}

const characterSprites: CharacterSpriteMap = {
  '앨리스': {
    normal: dorimSad,
    happy: dorimSmile,
    // 다른 표정 추가 가능
  },
  // 다른 캐릭터 추가 가능
};


const Game: React.FC = () => { // 컴포넌트 타입 명시
  // --- 상태 추가 ---
  const [showSettings, setShowSettings] = useState(false); // 설정 메뉴 표시 상태
  const [notificationMessage, setNotificationMessage] = useState(''); // 상단 알림 메시지 상태 추가

  // --- 커스텀 Hook 사용 ---
  // TODO: 현재는 테스트용 ID 사용. 라우팅 또는 상태 관리 통해 동적으로 받아와야 함.
  const episodeIdToLoad = '123e4567-e89b-12d3-a456-426614174000'; // 임시 테스트 ID
  const { episodeData, isLoadingEpisode } = useEpisodeLoader(episodeIdToLoad); // 에피소드 로딩 훅 호출
  // const { scriptData, isLoadingScript } = useScriptLoader(); // 스크립트 로딩 훅 호출 제거

  // episodeData에서 실제 스크립트 데이터 추출 (intro_dialogues 사용 가정)
  // null 또는 undefined일 경우 빈 배열([]) 사용
  const currentEpisodeScript = episodeData?.intro_dialogues ?? [];

  const {
    currentScriptIndex,
    gameFlags,
    setCurrentScriptIndex,
    setGameFlags,
    saveGame, // 저장 함수 가져오기
    loadGame  // 불러오기 함수 가져오기
  } = useGameState(currentEpisodeScript); // 게임 상태 훅 호출 (currentEpisodeScript 전달)
  const navigate = useNavigate(); // useNavigate 훅 사용

  // currentLine 계산은 로딩 완료 및 상태 로드 후로 이동

  // --- BGM 자동 재생 시도 및 정리 ---
  useEffect(() => {
    console.log('Game Component 마운트 - BGM 재생 시도');
    playBgm('mainTheme'); // 마운트 시 재생 시도 (음소거 상태일 수 있음)

    return () => {
      console.log('Game Component 언마운트 - BGM 정지');
      stopBgm(); // 언마운트 시 정지
    };
  }, []); // 빈 배열: 마운트/언마운트 시 1회 실행

  // --- 저장/불러오기 함수는 useGameState 훅으로 이동 ---
  // handleSaveGame, handleLoadGame 제거

  // 로딩 중 표시
  if (isLoadingEpisode) {
    return <div>Loading episode...</div>; // 로딩 메시지 변경
  }

  // 로딩 완료 후 로직 (currentEpisodeScript 사용)
  // currentLine 계산 시 currentEpisodeScript 유효성 및 인덱스 범위 확인 (타입 명시)
  const currentLine: ScriptLine | null = currentEpisodeScript && currentEpisodeScript.length > currentScriptIndex ? currentEpisodeScript[currentScriptIndex] : null;

  // currentLine이 null일 경우 렌더링하지 않거나 다른 처리 추가
  if (!currentLine) {
      // 에피소드 로딩은 완료되었지만 currentLine을 찾을 수 없는 경우 (예: 스크립트 끝)
      // 또는 로딩 실패 후 isLoadingEpisode가 false가 된 경우 currentEpisodeScript가 비어있을 수 있음
      if (currentEpisodeScript.length === 0 && !isLoadingEpisode) {
          return <div>Error: Failed to load episode data or script is empty.</div>; // 오류 메시지 변경
      }
      // 정상적으로 스크립트 끝에 도달한 경우
      return <div>Episode script ended.</div>; // 또는 다른 종료 화면
  }


  // --- 상호작용 핸들러 ---
  const handleNext = () => {
    // 함수 시작 시 명시적 타입 가드 (이미 위에서 처리됨)
    // if (!currentLine) return;
    signalInteraction(); // 첫 상호작용 시 오디오 활성화 신호 보내기
    // 타입 체크 후 속성 접근 (타입 단언 사용)
    if ((currentLine as ScriptLine).type === 'choice') return;
    playSfx('click'); // 효과음 재생 추가!

    let nextIndex = -1;
    // currentEpisodeScript 사용하도록 수정 (타입 단언 사용)
    if ((currentLine as ScriptLine).nextId) {
      // findIndex 콜백 파라미터 타입 지정
      nextIndex = currentEpisodeScript.findIndex((line: ScriptLine) => line.id === (currentLine as ScriptLine).nextId);
      if (nextIndex === -1) console.warn(`nextId '${(currentLine as ScriptLine).nextId}' 찾기 실패!`);
    } else if (currentScriptIndex < currentEpisodeScript.length - 1) { // currentEpisodeScript.length 사용
      nextIndex = currentScriptIndex + 1;
    }

    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      // 스크립트 끝 처리
      alert('스크립트가 종료되었습니다.');
      navigate('/'); // 타이틀 화면으로 이동
    }
  };

  // handleChoiceSelect 파라미터 타입 지정
  const handleChoiceSelect = (choiceId: string | number, nextId?: string | number) => {
    signalInteraction(); // 첫 상호작용 시 오디오 활성화 신호 보내기
    playSfx('click'); // 효과음 재생 추가!

    let nextIndex = -1;
    // currentEpisodeScript 사용하도록 수정
    if (nextId) {
        // findIndex 콜백 파라미터 타입 지정
        nextIndex = currentEpisodeScript.findIndex((line: ScriptLine) => line.id === nextId);
        if (nextIndex === -1) console.warn(`선택지의 nextId '${nextId}' 찾기 실패!`);
    }
    // nextId가 없으면 기존 방식 사용 (선택 사항)
    // else {
    //   nextIndex = currentEpisodeScript.findIndex(line => line.id === `${choiceId}_result`);
    //   if (nextIndex === -1) console.warn(`선택지 결과 ID '${choiceId}_result' 찾기 실패!`);
    // }

    // 선택지 ID를 gameFlags에 기록
    setGameFlags(prevFlags => ({
      ...prevFlags,
      previousChoice: choiceId // 'previousChoice' 키에 선택지 ID 저장
    }));
    console.log(`선택됨: ${choiceId}, 플래그 업데이트:`, { ...gameFlags, previousChoice: choiceId });


    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      console.log('선택지에 대한 다음 대사를 찾을 수 없습니다!');
      // 선택지 이후 진행이 막히면 안되므로, 다음 라인으로 넘어가는 기본 로직 추가 고려
      if (currentScriptIndex < currentEpisodeScript.length - 1) { // currentEpisodeScript.length 사용
         setCurrentScriptIndex(prevIndex => prevIndex + 1);
      } else {
         // 스크립트 끝 처리
         alert('스크립트가 종료되었습니다.');
         navigate('/'); // 타이틀 화면으로 이동
      }
    }
  };


  // ... (캐릭터 이미지 URL 결정 함수 등 - 타입 단언 및 키 존재 확인 추가) ...
  const getCharacterImageUrl = (): string | null => {
      // 함수 시작 시 명시적 타입 가드 (이미 위에서 처리됨)
      // if (!currentLine) return null;
      const line = currentLine as ScriptLine; // 타입 단언

      // character 속성 null/undefined 체크 강화
      if (!line.character || !(line.character in characterSprites)) return null; // 키 존재 확인 추가

      const characterName = line.character; // 타입 추론을 위해 변수에 할당
      // expression 속성 체크 강화
      const expression = line.expression || 'normal';

      // characterSprites 접근 시 characterName 유효성 확인
      const characterSpriteSet = characterSprites[characterName];
      if (!characterSpriteSet) return null; // 안전 장치

      // expression에 해당하는 스프라이트 반환, 없으면 'normal' 반환
      return characterSpriteSet[expression] || characterSpriteSet['normal'] || null; // 마지막 null은 혹시 모를 경우 대비
  };
  const characterImageUrl = getCharacterImageUrl();

  // --- 조건부 대사 결정 로직 (타입 단언 사용) ---
  // currentLine null 체크 후 속성 접근
  let dialogueTextToShow = (currentLine as ScriptLine).text ?? ''; // 기본 텍스트 (null 방지, nullish coalescing 사용)
  // currentLine 및 condition 속성 null/undefined 체크 강화
  // 명시적 타입 가드 추가
  if (currentLine && (currentLine as ScriptLine).condition && gameFlags[(currentLine as ScriptLine).condition!.flag] === (currentLine as ScriptLine).condition!.value) {
    // 조건 객체가 있고, 해당 플래그 값이 조건 값과 일치하면
    // altText, text 접근 시 currentLine은 null이 아님 (타입 단언 사용)
    dialogueTextToShow = (currentLine as ScriptLine).altText || (currentLine as ScriptLine).text || ''; // altText 사용 (null 방지)
    console.log(`조건 만족 (${(currentLine as ScriptLine).condition!.flag} === ${(currentLine as ScriptLine).condition!.value}), 대체 텍스트 표시: ${dialogueTextToShow}`);
  }


  return (
    // --- JSX 구조 (className 적용 방식은 styles 객체 사용으로 가정) ---
    <div className={styles.gameContainer}>
      <div className={styles.gameArea}>
        {/* 저장/불러오기/설정 버튼 */}
        <div className={styles.menuButtons}>
          {/* disabled 상태를 isLoadingEpisode 기준으로 변경 */}
          <button onClick={saveGame} className={styles.menuButton} disabled={isLoadingEpisode}>저장</button>
          <button onClick={loadGame} className={styles.menuButton} disabled={isLoadingEpisode}>불러오기</button>
          {/* 설정 버튼 추가 */}
          <button onClick={() => setShowSettings(true)} className={styles.menuButton}>설정</button>
        </div>

        {/* 상단 알림 메시지 */}
        {notificationMessage && (
          <div className={styles.notification}>
            {notificationMessage}
          </div>
        )}

        <Background imageUrl={roomBackground} />

        {/* JSX 내부에서는 상위의 if (!currentLine) return ...; 가드 덕분에 currentLine이 null이 아님 */}
        {/* 타입 단언 추가 */}
        {(currentLine as ScriptLine).character && (currentLine as ScriptLine).character !== '나' && (currentLine as ScriptLine).type !== 'narrator' && characterImageUrl && (
          <Character
            imageUrl={characterImageUrl}
            name={(currentLine as ScriptLine).character!} // non-null assertion 추가
          />
        )}

        {(currentLine as ScriptLine).type === 'choice' ? (
          <Choices
            // choices가 undefined일 수 있으므로 빈 배열([])로 기본값 제공
            choices={(currentLine as ScriptLine).choices ?? []}
            onChoiceSelect={handleChoiceSelect} // handleChoiceSelect 전달
          />
        ) : (
          <DialogueBox
            // characterName도 타입 단언 사용
            characterName={(currentLine as ScriptLine).type === 'narrator' ? null : (currentLine as ScriptLine).character}
            dialogueText={dialogueTextToShow} // 조건부로 결정된 텍스트 전달
            onNext={handleNext} // handleNext 전달
          />
        )}

        {/* PhoneChat 컴포넌트 추가 */}
        <PhoneChat />
      </div>

      {/* 설정 메뉴 조건부 렌더링 */}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default Game;
