import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import styles from "./StoryScene.module.css";

interface StoryMenuBarProps {
  onSave: () => void;
  onLoad: () => void;
  onSettings: () => void;
  onTogglePhoneChat: () => void;
  isPhoneChatVisible: boolean;
  isLoading: boolean;
}

const StoryMenuBar: React.FC<StoryMenuBarProps> = ({
  onSave,
  onLoad,
  onSettings,
  onTogglePhoneChat,
  isPhoneChatVisible,
  isLoading,
}) => {
  const { t } = useTranslation("storyMenu"); // Initialize useTranslation

  return (
    <div className={styles.menuButtons}>
      <button
        onClick={onSave}
        className={styles.menuButton}
        disabled={isLoading}
      >
        {t("save")}
      </button>
      <button
        onClick={onLoad}
        className={styles.menuButton}
        disabled={isLoading}
      >
        {t("load")}
      </button>
      <button
        onClick={onSettings}
        className={styles.menuButton}
        disabled={isLoading}
      >
        {t("settings")}
      </button>
      <button
        onClick={onTogglePhoneChat}
        className={styles.menuButton}
        disabled={isLoading}
      >
        {isPhoneChatVisible ? t("hideChat") : t("showChat")}
      </button>
    </div>
  );
};

export default StoryMenuBar;
