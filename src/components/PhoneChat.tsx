import React from 'react';
import styles from './PhoneChat.module.css';

// 임시 메시지 데이터
const messages = [
  { id: 1, sender: 'other', text: '안녕하세요! 디티알톡입니다.' },
  { id: 2, sender: 'me', text: '네, 안녕하세요.' },
  { id: 3, sender: 'other', text: '무슨 일로 연락 주셨나요?' },
];

function PhoneChat() {
  return (
    <div className={styles.phoneChatContainer}>
      <div className={styles.chatHeader}>
        디티알톡
      </div>
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageBubble} ${styles[msg.sender]}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input type="text" placeholder="메시지 입력..." className={styles.textInput} />
        <button className={styles.sendButton}>전송</button>
      </div>
    </div>
  );
}

export default PhoneChat;
