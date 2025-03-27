import React from 'react';
import './Character.css';

const Character = ({ imageUrl, name }) => {
  return (
    <div className="character">
      <img
        src={imageUrl}
        alt={name}
        className="character__image"
      />
    </div>
  );
};

export default Character;