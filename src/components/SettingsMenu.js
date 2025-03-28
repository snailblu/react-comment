import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import { SettingsContext } from '../contexts/SettingsContext';
import styles from './SettingsMenu.module.css'; // CSS 모듈 import
// import useGameState from '../hooks/useGameState'; // 기능 구현 시 필요할 수 있음

const SettingsMenu = ({ onClose }) => { // onClose 함수를 prop으로 받음
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume } = useContext(SettingsContext);
  const navigate = useNavigate(); // useNavigate 훅 사용
  // const { saveGame, loadGame } = useGameState(); // 기능 구현 시 필요

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

        {/* 시스템 메뉴 버튼들 */}
        <div className={styles.systemButtons}>
          {/* 기능 구현 시 onClick 핸들러 수정 필요 */}
          <button onClick={() => console.log('Save clicked')} className={styles.systemButton}>저장</button>
          <button onClick={() => console.log('Load clicked')} className={styles.systemButton}>로드</button>
          <button onClick={() => console.log('Language clicked')} className={styles.systemButton}>언어 변경</button>
          <button onClick={() => { console.log('Go to Title clicked'); navigate('/'); onClose(); }} className={styles.systemButton}>타이틀로</button>
          <button onClick={() => { console.log('Exit clicked'); window.close(); }} className={styles.systemButton}>종료</button> {/* 웹페이지에서는 종료 기능 제한적 */}
        </div>

        <button onClick={onClose} className={styles.closeButton}>닫기</button>
      </div>
    </div>
  );
};

export default SettingsMenu;
