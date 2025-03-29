import React from 'react';
import styles from './StoryScene.module.css'; // StoryScene의 스타일 재사용 (필요시 분리)

interface StoryMenuBarProps {
  onSave: () => void;
  onLoad: () => void;
  onSettings: () => void;
  onTogglePhoneChat: () => void;
  isPhoneChatVisible: boolean;
  isLoading: boolean; // 로딩 상태 추가 (버튼 비활성화용)
}

const StoryMenuBar: React.FC<StoryMenuBarProps> = ({
  onSave,
  onLoad,
  onSettings,
  onTogglePhoneChat,
  isPhoneChatVisible,
  isLoading,
}) => {
  return (
    <div className={styles.menuButtons}>
      <button onClick={onSave} className={styles.menuButton} disabled={isLoading}>
        저장
      </button>
      <button onClick={onLoad} className={styles.menuButton} disabled={isLoading}>
        불러오기
      </button>
      <button onClick={onSettings} className={styles.menuButton} disabled={isLoading}>
        설정
      </button>
      <button onClick={onTogglePhoneChat} className={styles.menuButton} disabled={isLoading}>
        {isPhoneChatVisible ? '디티알톡 숨기기' : '디티알톡 보이기'}
      </button>
    </div>
  );
};

export default StoryMenuBar;
