import React, { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next"; // Import TFunction type
import { useSettingsStore } from "../stores/settingsStore";
import styles from "./SettingsMenu.module.css";
// import { saveGame, loadGame } from '../utils/saveLoad'; // 저장/로드 유틸리티 함수 import 고려

// Props 타입 정의
interface SettingsMenuProps {
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  // Specify namespace in useTranslation hook
  const { t, i18n } = useTranslation("settings");
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

  // 언어 변경 핸들러
  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const langCode = event.target.value;
    i18n.changeLanguage(langCode);
    // Optionally, save to Zustand store as well if needed elsewhere
    // useSettingsStore.getState().setLanguage(langCode);
  };

  return (
    <div className={styles.settingsOverlay}>
      <div className={styles.settingsMenu}>
        <h2>{t("title")}</h2> {/* Remove namespace prefix */}
        <div className={styles.settingItem}>
          <label htmlFor="bgmVolume">{t("bgmVolumeLabel")}</label>{" "}
          {/* Remove namespace prefix */}
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
          <label htmlFor="sfxVolume">{t("sfxVolumeLabel")}</label>{" "}
          {/* Remove namespace prefix */}
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
        {/* 언어 선택 */}
        <div className={styles.settingItem}>
          <label htmlFor="languageSelect">{t("languageLabel")}</label>{" "}
          {/* Remove namespace prefix */}
          <select
            id="languageSelect"
            value={i18n.language}
            onChange={handleLanguageChange}
            className={styles.languageSelect} // Add specific styles if needed
          >
            <option value="ko">{t("langKo")}</option>{" "}
            {/* Remove namespace prefix */}
            <option value="en">{t("langEn")}</option>{" "}
            {/* Remove namespace prefix */}
            <option value="zh">{t("langZh")}</option>{" "}
            {/* Remove namespace prefix */}
          </select>
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
            {t("saveButton")} {/* Remove namespace prefix */}
          </button>
          <button
            onClick={() =>
              console.log("Load clicked - Implement loadGame logic")
            }
            className={styles.systemButton}
          >
            {t("loadButton")} {/* Remove namespace prefix */}
          </button>
          {/* 언어 변경 버튼 제거됨 */}
          <button
            onClick={() => {
              console.log("Go to Title clicked");
              navigate("/");
              onClose();
            }}
            className={styles.systemButton}
          >
            {t("titleButton")} {/* Remove namespace prefix */}
          </button>
          <button
            onClick={() => {
              console.log("Exit clicked");
              window.close(); // Note: This might not work in all browser contexts
            }}
            className={styles.systemButton}
          >
            {t("exitButton")} {/* Remove namespace prefix */}
          </button>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          {t("closeButton")} {/* Remove namespace prefix */}
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;
