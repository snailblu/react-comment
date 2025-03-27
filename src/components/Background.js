import React from 'react';
import styles from './Background.module.css';

const Background = ({ imageUrl }) => {
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