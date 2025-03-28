import React from 'react';
import styles from './MonologueBox.module.css'; // 생성한 CSS 모듈 import

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
    // CSS 모듈의 monologueBoxContainer 클래스 적용
    <div className={styles.monologueBoxContainer} onClick={handleClick}>
      {/* monologue-text 클래스는 CSS 모듈에서 직접 스타일링하거나 제거 가능 */}
      <p>{text}</p>
      {/* 필요하다면 '다음' 버튼이나 표시기 추가 */}
    </div>
  );
};

export default MonologueBox;
