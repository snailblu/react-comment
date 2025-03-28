import React from 'react';
import styles from './Character.module.css';

// Props 타입 정의
interface CharacterProps {
  imageUrl: string;
  name: string;
}

const Character: React.FC<CharacterProps> = ({ imageUrl, name }) => {
  return (
    <div className={styles.character}>
      <img
        src={imageUrl}
        alt={name}
        className={styles.character__image}
      />
    </div>
  );
};

export default Character;
