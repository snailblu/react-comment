import React from 'react';
import './Choices.css';

const Choices = ({ choices, onChoiceSelect }) => {
  return (
    <div className="choices-container">
      {choices.map(choice => (
        <button
          key={choice.id}
          className="choice-button"
          onClick={() => onChoiceSelect(choice.id)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
};

export default Choices;