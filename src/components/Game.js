import React, { useState, useEffect } from 'react';
// audioManager 함수 import 수정
import { playBgm, stopBgm, playSfx, signalInteraction } from '../utils/audioManager';
import Background from './Background';
import Character from './Character';
import DialogueBox from './DialogueBox';
import Choices from './Choices';
import styles from './Game.module.css';
import roomBackground from '../assets/oneroom.png';
import dorimSmile from '../assets/dorim_smile.png';
import dorimSad from '../assets/dorim_sad.png';
// unmuteAfterInteraction import 제거

const characterSprites = {
  '앨리스': {
    normal: dorimSad,
    happy: dorimSmile
  }
};

const script = [
  // ... (스크립트 내용은 이전과 동일) ...
  { id: 's1', type: 'dialogue', character: '앨리스', expression: 'normal', text: '이제 조건부 렌더링을 써볼까?' },
  { id: 's2', type: 'dialogue', character: '나', text: '조건부 렌더링? 그게 뭔데?' },
  { id: 's3', type: 'dialogue', character: '앨리스', expression: 'happy', text: '응! 특정 조건일 때만 캐릭터를 보여주거나 표정을 바꾸는 거지!' },
  { id: 's4', type: 'narrator', text: '(앨리스는 신나게 설명하기 시작했다.)' },
  { id: 's5', type: 'dialogue', character: '앨리스', expression: 'normal', text: '다시 원래 표정으로 돌아왔어.' },
  { id: 's6', type: 'dialogue', character: '앨리스', expression: 'normal', text: '이제 선택지를 만들어 볼까?' },
  {
    id: 's7_choice',
    type: 'choice',
    choices: [
      { id: 'c1', text: '좋아! 재밌겠다!', nextId: 'c1_result' },
      { id: 'c2', text: '선택지는 어떻게 만드는데?', nextId: 'c2_result' }
    ]
  },
  { id: 'c1_result', type: 'dialogue', character: '앨리스', expression: 'happy', text: '역시! 너도 해보고 싶었구나!', nextId: 's8_common' },
  { id: 'c2_result', type: 'dialogue', character: '앨리스', expression: 'normal', text: '음, 버튼을 만들고 클릭하면 다음 대사 ID를 찾아가는 거지.', nextId: 's8_common' },
  { id: 's8_common', type: 'dialogue', character: '앨리스', text: '이런 식으로 분기를 만들 수 있어.' } // 공통 라인 ID 변경됨
];

const Game = () => {
  // audioUnmuted state 제거
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const currentLine = script[currentScriptIndex];

  // --- BGM 자동 재생 시도 및 정리 ---
  useEffect(() => {
    console.log('Game Component 마운트 - BGM 재생 시도');
    playBgm('mainTheme'); // 마운트 시 재생 시도 (음소거 상태일 수 있음)

    return () => {
      console.log('Game Component 언마운트 - BGM 정지');
      stopBgm(); // 언마운트 시 정지
    };
  }, []); // 빈 배열: 마운트/언마운트 시 1회 실행

  // --- 상호작용 핸들러 ---
  const handleNext = () => {
    signalInteraction(); // 첫 상호작용 시 오디오 활성화 신호 보내기
    if (currentLine.type === 'choice') return;
    playSfx('click'); // 효과음 재생 추가!

    // ... (nextId 또는 인덱스 증가 로직 - 이전과 동일) ...
    let nextIndex = -1;
    if (currentLine.nextId) {
      nextIndex = script.findIndex(line => line.id === currentLine.nextId);
      if (nextIndex === -1) console.warn(`nextId '${currentLine.nextId}' 찾기 실패!`);
    } else if (currentScriptIndex < script.length - 1) {
      nextIndex = currentScriptIndex + 1;
    }

    if (nextIndex !== -1) setCurrentScriptIndex(nextIndex);
    else console.log('스크립트 끝!');
  };

  const handleChoiceSelect = (choiceId, nextId) => { // nextId 인자 추가됨 (Choices 컴포넌트도 수정 필요할 수 있음)
    signalInteraction(); // 첫 상호작용 시 오디오 활성화 신호 보내기
    playSfx('click'); // 효과음 재생 추가!

    let nextIndex = -1;
    // 선택지 객체에 nextId가 있으면 우선 사용
    if (nextId) {
        nextIndex = script.findIndex(line => line.id === nextId);
        if (nextIndex === -1) console.warn(`선택지의 nextId '${nextId}' 찾기 실패!`);
    }
    // nextId가 없으면 기존 방식 사용 (선택 사항)
    // else {
    //   nextIndex = script.findIndex(line => line.id === `${choiceId}_result`);
    //   if (nextIndex === -1) console.warn(`선택지 결과 ID '${choiceId}_result' 찾기 실패!`);
    // }

    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      console.log('선택지에 대한 다음 대사를 찾을 수 없습니다!');
      // 선택지 이후 진행이 막히면 안되므로, 다음 라인으로 넘어가는 기본 로직 추가 고려
      if (currentScriptIndex < script.length - 1) {
         setCurrentScriptIndex(prevIndex => prevIndex + 1);
      } else {
         console.log('스크립트 끝!');
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