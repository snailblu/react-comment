import React from 'react';
import styles from './Character.module.css';

const Character = ({ imageUrl, name }) => {
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