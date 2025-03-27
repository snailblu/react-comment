import React from 'react';
import './Background.css';

const Background = ({ imageUrl }) => {
  return (
    <div className="background">
      <img
        src={imageUrl}
        alt="Background"
        className="background__image"
      />
    </div>
  );
};

export default Background;