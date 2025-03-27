import React, { useState } from 'react';
import Background from './Background';
import Character from './Character';
import DialogueBox from './DialogueBox';
import Choices from './Choices';
import styles from './Game.module.css';
import roomBackground from '../assets/oneroom.png';
import dorimSmile from '../assets/dorim_smile.png';
import dorimSad from '../assets/dorim_sad.png';

const characterSprites = {
  '앨리스': {
    normal: dorimSad,
    happy: dorimSmile // 실제로는 다른 표정 이미지를 사용해야 합니다
  }
};

const script = [
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
  { id: 'c1_result', type: 'dialogue', character: '앨리스', expression: 'happy', text: '역시! 너도 해보고 싶었구나!', nextId: 's8' },
  { id: 'c2_result', type: 'dialogue', character: '앨리스', expression: 'normal', text: '음, 버튼을 만들고 클릭하면 다음 대사 ID를 찾아가는 거지.', nextId: 's8' },
  { id: 's8', type: 'dialogue', character: '앨리스', text: '이런 식으로 분기를 만들 수 있어.' }
];

const Game = () => {
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const currentLine = script[currentScriptIndex];

  const handleChoiceSelect = (choiceId, nextId) => {
    if (nextId) {
      const nextIndex = script.findIndex(line => line.id === nextId);
      if (nextIndex !== -1) {
        setCurrentScriptIndex(nextIndex);
      } else {
        console.log('다음 대사를 찾을 수 없습니다!');
      }
    } else {
      const resultIndex = script.findIndex(line => line.id === `${choiceId}_result`);
      if (resultIndex !== -1) {
        setCurrentScriptIndex(resultIndex);
      } else {
        console.log('선택지에 대한 결과를 찾을 수 없습니다!');
      }
    }
  };

  const handleNext = () => {
    if (currentLine.type === 'choice') {
      return; // 선택지 화면에서는 클릭으로 넘어가지 않도록 함
    }
    if (currentLine.nextId) {
      const nextIndex = script.findIndex(line => line.id === currentLine.nextId);
      if (nextIndex !== -1) {
        setCurrentScriptIndex(nextIndex);
        return;
      }
    }
    if (currentScriptIndex < script.length - 1) {
      setCurrentScriptIndex(prevIndex => prevIndex + 1);
    } else {
      console.log('스크립트가 끝났습니다!');
    }
  };
  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameArea}>
        <Background 
          imageUrl={roomBackground}
        />
        {currentLine.character && currentLine.character !== '나' && currentLine.type !== 'narrator' && (
          <Character 
            imageUrl={currentLine.character in characterSprites ? 
              characterSprites[currentLine.character][currentLine.expression || 'normal'] : 
              dorimSmile
            }
            name={currentLine.character}
          />
        )}
        {currentLine.type === 'choice' ? (
          <Choices
            choices={currentLine.choices}
            onChoiceSelect={handleChoiceSelect}
          />
        ) : (
          <DialogueBox 
            characterName={currentLine.type === 'narrator' ? null : currentLine.character}
            dialogueText={currentLine.text}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
};

export default Game;