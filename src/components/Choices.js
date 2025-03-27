import React from 'react';
import styles from './Choices.module.css';

const Choices = ({ choices, onChoiceSelect }) => {
  return (
    <div className={styles.choicesContainer}>
      {choices.map(choice => (
        <button
          key={choice.id}
          className={styles.choiceButton}
          onClick={() => onChoiceSelect(choice.id, choice.nextId)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
};

export default Choices;