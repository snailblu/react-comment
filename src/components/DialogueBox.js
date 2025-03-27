import React from 'react';
import styles from './DialogueBox.module.css';

const DialogueBox = ({ characterName, dialogueText, onNext }) => {
  return (
    <div className={styles.dialogueBox} onClick={onNext}>
      {characterName && (
        <div className={styles.dialogueBox__characterName}>
          {characterName}
        </div>
      )}
      <div className={styles.dialogueBox__text}>
        {dialogueText}
      </div>
    </div>
  );
};

export default DialogueBox;