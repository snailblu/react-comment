import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import styles from './SettingsMenu.module.css'; // CSS 모듈 import

const SettingsMenu = ({ onClose }) => { // onClose 함수를 prop으로 받음
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume } = useContext(SettingsContext);

  const handleBgmChange = (event) => {
    setBgmVolume(Number(event.target.value));
  };

  const handleSfxChange = (event) => {
    setSfxVolume(Number(event.target.value));
  };

  return (
    <div className={styles.settingsOverlay}>
      <div className={styles.settingsMenu}>
        <h2>설정</h2>
        <div className={styles.settingItem}>
          <label htmlFor="bgmVolume">배경음악 볼륨:</label>
          <input
            type="range"
            id="bgmVolume"
            name="bgmVolume"
            min="0"
            max="1"
            step="0.01"
            value={bgmVolume}
            onChange={handleBgmChange}
          />
          <span>{Math.round(bgmVolume * 100)}%</span>
        </div>
        <div className={styles.settingItem}>
          <label htmlFor="sfxVolume">효과음 볼륨:</label>
          <input
            type="range"
            id="sfxVolume"
            name="sfxVolume"
            min="0"
            max="1"
            step="0.01"
            value={sfxVolume}
            onChange={handleSfxChange}
          />
          <span>{Math.round(sfxVolume * 100)}%</span>
        </div>
        <button onClick={onClose} className={styles.closeButton}>닫기</button>
      </div>
    </div>
  );
};

export default SettingsMenu;
