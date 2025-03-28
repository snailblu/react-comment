import React from 'react';
import styles from './Choices.module.css';

// 선택지 옵션 타입 정의
interface ChoiceOption {
  id: string | number; // id 타입 (string 또는 number로 가정)
  text: string;
  nextId?: string | number; // nextId는 선택 사항일 수 있음 (string 또는 number로 가정)
}

// Props 타입 정의
interface ChoicesProps {
  choices: ChoiceOption[];
  onChoiceSelect: (choiceId: string | number, nextId?: string | number) => void; // 함수 타입 정의
}

const Choices: React.FC<ChoicesProps> = ({ choices, onChoiceSelect }) => {
  return (
    <div className={styles.choicesContainer}>
      {choices.map((choice: ChoiceOption) => ( // choice 타입 명시
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
