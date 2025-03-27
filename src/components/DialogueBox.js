import React from 'react';

const DialogueBox = ({ characterName, dialogueText }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '100px',
      backgroundColor: 'white',
      border: '2px solid black',
      zIndex: 2,
      padding: '10px 20px'
    }}>
      <div style={{
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333'
      }}>
        {characterName}
      </div>
      <div style={{
        fontSize: '1em',
        color: '#666',
        lineHeight: '1.4'
      }}>
        {dialogueText}
      </div>
    </div>
  );
};

export default DialogueBox;