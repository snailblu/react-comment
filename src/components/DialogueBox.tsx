import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import styles from "./DialogueBox.module.css";

// Props 타입 정의
interface DialogueBoxProps {
  characterName?: string | null; // 이름은 선택적이거나 null일 수 있음
  dialogueText: string;
  onNext: () => void; // 클릭 이벤트 핸들러 함수 타입
}

const DialogueBox: React.FC<DialogueBoxProps> = ({
  characterName,
  dialogueText,
  onNext,
}) => {
  const { t } = useTranslation("characters"); // Initialize useTranslation

  return (
    <div className={styles.dialogueBox} onClick={onNext}>
      {characterName && (
        <div className={styles.dialogueBox__characterName}>
          {/* Translate character name if it exists */}
          {t(characterName)}
        </div>
      )}
      <div className={styles.dialogueBox__text}>{dialogueText}</div>
    </div>
  );
};

export default DialogueBox;
