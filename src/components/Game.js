import React from 'react';
import Background from './Background';
import Character from './Character';
import DialogueBox from './DialogueBox';

const Game = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#eee',
      overflow: 'hidden'
    }}>
      <Background 
        imageUrl="https://via.placeholder.com/1280x720/cccccc/969696?text=Background"
      />
      <Character 
        imageUrl="https://via.placeholder.com/150x300/90ee90/000000?text=Character"
        name="캐릭터"
      />
      <DialogueBox 
        characterName="앨리스"
        dialogueText="안녕하세요! 비주얼 노벨에 오신 것을 환영합니다."
      />
    </div>
  );
};

export default Game;