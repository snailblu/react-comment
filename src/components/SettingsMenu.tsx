import React, { ChangeEvent } from "react"; // useContext 제거, ChangeEvent 유지
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../stores/settingsStore"; // Zustand 스토어 import
import styles from "./SettingsMenu.module.css";
// import { useGameState } from '../stores/gameStateStore'; // Zustand 스토어로 변경 고려
// import { saveGame, loadGame } from '../utils/saveLoad'; // 저장/로드 유틸리티 함수 import 고려

// Props 타입 정의
interface SettingsMenuProps {
  onClose: () => void; // onClose 함수 타입 정의
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  // Zustand 스토어에서 상태와 액션 가져오기
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume } =
    useSettingsStore();
  const navigate = useNavigate();
  // TODO: 저장/로드 기능 구현 시 관련 스토어 또는 유틸리티 사용
  // const { saveGameState } = useGameState(); // 예시
  // const { loadGameState } = useGameState(); // 예시

  // 이벤트 핸들러 파라미터 타입 지정
  const handleBgmChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBgmVolume(Number(event.target.value));
  };

  // 이벤트 핸들러 파라미터 타입 지정
  const handleSfxChange = (event: ChangeEvent<HTMLInputElement>) => {
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
          {/* TODO: 저장/로드 기능 연결 */}
          <button
            onClick={() =>
              console.log("Save clicked - Implement saveGame logic")
            }
            className={styles.systemButton}
          >
            저장
          </button>
          <button
            onClick={() =>
              console.log("Load clicked - Implement loadGame logic")
            }
            className={styles.systemButton}
          >
            로드
          </button>
          {/* TODO: 언어 변경 기능 연결 */}
          <button
            onClick={() =>
              console.log("Language clicked - Implement language change")
            }
            className={styles.systemButton}
          >
            언어 변경
          </button>
          <button
            onClick={() => {
              console.log("Go to Title clicked");
              navigate("/");
              onClose();
            }}
            className={styles.systemButton}
          >
            타이틀로
          </button>
          <button
            onClick={() => {
              console.log("Exit clicked");
              window.close();
            }}
            className={styles.systemButton}
          >
            종료
          </button>{" "}
          {/* 웹페이지에서는 종료 기능 제한적 */}
        </div>

        <button onClick={onClose} className={styles.closeButton}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;
