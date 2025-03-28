import React from 'react';
import styles from './Background.module.css';

// Props 타입 정의
interface BackgroundProps {
  imageUrl: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <div className={styles.background}>
      <img
        src={imageUrl}
        alt="Background"
        className={styles.background__image}
      />
    </div>
  );
};

export default Background;
