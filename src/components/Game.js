import React, { useState, useEffect } from 'react';
// audioManager 함수 import 수정
import { playBgm, stopBgm, playSfx, signalInteraction } from '../utils/audioManager';
import Background from './Background';
import Character from './Character';
import DialogueBox from './DialogueBox';
import Choices from './Choices';
import styles from './Game.module.css'; // CSS 모듈 import 확인
import roomBackground from '../assets/oneroom.png';
import dorimSmile from '../assets/dorim_smile.png';
import dorimSad from '../assets/dorim_sad.png';
// unmuteAfterInteraction import 제거

const SAVE_KEY = 'saveDataVn'; // 로컬 스토리지 키 정의

const characterSprites = {
  '앨리스': {
    normal: dorimSad,
    happy: dorimSmile
  }
};

const Game = () => {
  // scriptData, isLoadingScript state 추가
  const [scriptData, setScriptData] = useState([]);
  const [isLoadingScript, setIsLoadingScript] = useState(true);
  // useState 초기값 함수 형태로 변경
  const [currentScriptIndex, setCurrentScriptIndex] = useState(() => {
    console.log('게임 상태 로드 시도...');
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // 저장된 인덱스가 유효한 숫자인지 확인
        if (typeof parsedData.currentScriptIndex === 'number' && parsedData.currentScriptIndex >= 0) {
          console.log('저장된 데이터 로드 성공:', parsedData.currentScriptIndex);
          return parsedData.currentScriptIndex;
        } else {
          console.warn('저장된 currentScriptIndex가 유효하지 않습니다:', parsedData.currentScriptIndex);
        }
      } catch (e) {
        console.error('저장된 데이터 파싱 오류:', e);
      }
    }
    console.log('저장된 데이터 없음 또는 유효하지 않음, 처음부터 시작');
    return 0; // 저장된 값 없거나 유효하지 않으면 0 반환
  });
  // currentLine 계산은 로딩 완료 후로 이동

  // --- 스크립트 데이터 로딩 ---
  useEffect(() => {
    fetch('/script.json') // public 폴더 기준 경로
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setScriptData(data);
        setIsLoadingScript(false);
        console.log('스크립트 로딩 완료');
      })
      .catch(error => {
        console.error('스크립트 로딩 실패:', error);
        setIsLoadingScript(false); // 에러 발생 시에도 로딩 상태는 해제
      });
  }, []); // 마운트 시 1회 실행

  // --- BGM 자동 재생 시도 및 정리 ---
  useEffect(() => {
    console.log('Game Component 마운트 - BGM 재생 시도');
    playBgm('mainTheme'); // 마운트 시 재생 시도 (음소거 상태일 수 있음)

    return () => {
      console.log('Game Component 언마운트 - BGM 정지');
      stopBgm(); // 언마운트 시 정지
    };
  }, []); // 빈 배열: 마운트/언마운트 시 1회 실행

  // --- 저장/불러오기 함수 ---
  const handleSaveGame = () => {
    if (isLoadingScript) {
      alert('스크립트 로딩 중에는 저장할 수 없습니다.');
      return;
    }
    try {
      const dataToSave = { currentScriptIndex };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      console.log('게임 저장 완료:', dataToSave);
      alert('게임이 저장되었습니다!'); // 간단한 피드백
    } catch (e) {
      console.error('게임 저장 실패:', e);
      alert('게임 저장에 실패했습니다.');
    }
  };

  const handleLoadGame = () => {
    if (isLoadingScript) {
      alert('스크립트 로딩 중에는 불러올 수 없습니다.');
      return;
    }
    console.log('게임 불러오기 시도...');
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // 불러온 인덱스가 유효한 숫자인지, 그리고 현재 로드된 스크립트 범위 내인지 확인
        if (typeof parsedData.currentScriptIndex === 'number' &&
            parsedData.currentScriptIndex >= 0 &&
            parsedData.currentScriptIndex < scriptData.length) { // scriptData.length 확인 추가
          setCurrentScriptIndex(parsedData.currentScriptIndex);
          console.log('게임 불러오기 완료:', parsedData.currentScriptIndex);
          alert('게임을 불러왔습니다!');
        } else {
           console.warn('저장된 인덱스가 유효하지 않거나 스크립트 범위를 벗어납니다:', parsedData.currentScriptIndex);
           alert('유효하지 않은 저장 데이터입니다.');
        }
      } catch (e) {
        console.error('저장된 데이터 파싱 오류:', e);
        alert('저장된 데이터를 불러오는 데 실패했습니다.');
      }
    } else {
      console.log('저장된 데이터 없음');
      alert('저장된 게임 데이터가 없습니다.');
    }
  };

  // 로딩 중 표시
  if (isLoadingScript) {
    return <div>Loading script...</div>;
  }

  // 로딩 완료 후 로직 (scriptData 사용)
  // currentLine 계산 시 scriptData 유효성 및 인덱스 범위 확인
  const currentLine = scriptData && scriptData.length > currentScriptIndex ? scriptData[currentScriptIndex] : null;

  // currentLine이 null일 경우 렌더링하지 않거나 다른 처리 추가
  if (!currentLine) {
      // 스크립트 로딩은 완료되었지만 currentLine을 찾을 수 없는 경우 (예: 스크립트 끝)
      // 또는 로딩 실패 후 isLoadingScript가 false가 된 경우 scriptData가 비어있을 수 있음
      if (scriptData.length === 0 && !isLoadingScript) {
          return <div>Error: Failed to load script data.</div>;
      }
      // 정상적으로 스크립트 끝에 도달한 경우
      return <div>Script ended.</div>; // 또는 다른 종료 화면
  }


  // --- 상호작용 핸들러 ---
  const handleNext = () => {
    signalInteraction(); // 첫 상호작용 시 오디오 활성화 신호 보내기
    if (currentLine.type === 'choice') return;
    playSfx('click'); // 효과음 재생 추가!

    let nextIndex = -1;
    // scriptData 사용하도록 수정
    if (currentLine.nextId) {
      nextIndex = scriptData.findIndex(line => line.id === currentLine.nextId);
      if (nextIndex === -1) console.warn(`nextId '${currentLine.nextId}' 찾기 실패!`);
    } else if (currentScriptIndex < scriptData.length - 1) { // scriptData.length 사용
      nextIndex = currentScriptIndex + 1;
    }

    if (nextIndex !== -1) setCurrentScriptIndex(nextIndex);
    else console.log('스크립트 끝!');
  };

  const handleChoiceSelect = (choiceId, nextId) => { // nextId 인자 추가됨 (Choices 컴포넌트도 수정 필요할 수 있음)
    signalInteraction(); // 첫 상호작용 시 오디오 활성화 신호 보내기
    playSfx('click'); // 효과음 재생 추가!

    let nextIndex = -1;
    // scriptData 사용하도록 수정
    if (nextId) {
        nextIndex = scriptData.findIndex(line => line.id === nextId);
        if (nextIndex === -1) console.warn(`선택지의 nextId '${nextId}' 찾기 실패!`);
    }
    // nextId가 없으면 기존 방식 사용 (선택 사항)
    // else {
    //   nextIndex = scriptData.findIndex(line => line.id === `${choiceId}_result`);
    //   if (nextIndex === -1) console.warn(`선택지 결과 ID '${choiceId}_result' 찾기 실패!`);
    // }

    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      console.log('선택지에 대한 다음 대사를 찾을 수 없습니다!');
      // 선택지 이후 진행이 막히면 안되므로, 다음 라인으로 넘어가는 기본 로직 추가 고려
      if (currentScriptIndex < scriptData.length - 1) { // scriptData.length 사용
         setCurrentScriptIndex(prevIndex => prevIndex + 1);
      } else {
         console.log('스크립트 끝!'); // 스크립트 끝 처리
      }
    }
  };


  // ... (캐릭터 이미지 URL 결정 함수 등 - 이전과 동일) ...
  const getCharacterImageUrl = () => {
      if (!currentLine.character || !characterSprites[currentLine.character]) return null;
      const expression = currentLine.expression || 'normal';
      return characterSprites[currentLine.character][expression] || characterSprites[currentLine.character]['normal'];
  };
  const characterImageUrl = getCharacterImageUrl();


  return (
    // --- JSX 구조 (className 적용 방식은 styles 객체 사용으로 가정) ---
    <div className={styles.gameContainer}>
      <div className={styles.gameArea}>
        {/* 저장/불러오기 버튼 추가 */}
        <div className={styles.menuButtons}>
          <button onClick={handleSaveGame} className={styles.menuButton}>저장</button>
          <button onClick={handleLoadGame} className={styles.menuButton}>불러오기</button>
        </div>

        <Background imageUrl={roomBackground} />

        {currentLine.character && currentLine.character !== '나' && currentLine.type !== 'narrator' && characterImageUrl && (
          <Character
            imageUrl={characterImageUrl}
            name={currentLine.character}
          />
        )}

        {currentLine.type === 'choice' ? (
          <Choices
            choices={currentLine.choices}
            onChoiceSelect={handleChoiceSelect} // handleChoiceSelect 전달
          />
        ) : (
          <DialogueBox
            characterName={currentLine.type === 'narrator' ? null : currentLine.character}
            dialogueText={currentLine.text}
            onNext={handleNext} // handleNext 전달
          />
        )}
      </div>
    </div>
  );
};

export default Game;
