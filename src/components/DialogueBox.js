import React from 'react';
import './DialogueBox.css';

const DialogueBox = ({ characterName, dialogueText, onNext }) => {
  return (
    <div className="dialogue-box" onClick={onNext}>
      {characterName && (
        <div className="dialogue-box__character-name">
          {characterName}
        </div>
      )}
      <div className="dialogue-box__text">
        {dialogueText}
      </div>
    </div>
  );
};

export default DialogueBox;