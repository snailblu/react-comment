import React from 'react';

const Character = ({ imageUrl, name }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '150px',
      height: '300px',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <img
        src={imageUrl}
        alt={name}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default Character;