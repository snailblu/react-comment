import React from 'react';
// import styles from './MonologueBox.module.css'; // DialogueBox와 유사하게 스타일링 가능

interface MonologueBoxProps {
  text: string;
  onNext?: () => void; // 다음으로 넘어가는 기능이 필요하다면 추가
}

const MonologueBox: React.FC<MonologueBoxProps> = ({ text, onNext }) => {
  // DialogueBox와 유사하게 클릭 시 다음으로 넘어가는 로직 추가 가능
  const handleClick = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <div /* className={styles.monologueBoxContainer} */ onClick={handleClick}>
      <p className="monologue-text">{text}</p> {/* 스타일링을 위한 클래스 */}
      {/* 필요하다면 '다음' 버튼이나 표시기 추가 */}
    </div>
  );
};

export default MonologueBox;
