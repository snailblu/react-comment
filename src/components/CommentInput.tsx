import React, { useState, useEffect } from "react"; // Add useEffect import
import { useTranslation } from "react-i18next";
// import { TFunction } from "i18next"; // Remove unused import
import styles from "./CommentInput.module.css";

interface CommentInputProps {
  // 대댓글 모드에서는 parentId가 필요 없으므로 onSubmit 시그니처는 유지
  onSubmit: (commentText: string, nickname?: string, password?: string) => void;
  disabled?: boolean;
  onCancel?: () => void; // 취소 핸들러 추가 (선택적)
  isReplyMode?: boolean; // 대댓글 모드 여부 추가 (선택적)
}

// const DEFAULT_NICKNAME = "연갤러"; // Remove constant, get from translation

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  disabled = false,
  onCancel,
  isReplyMode = false,
}) => {
  // Specify namespace in useTranslation hook
  const { t } = useTranslation("commentInput");
  // Remove i18n instance if not needed elsewhere

  const [useDefaultNickname, setUseDefaultNickname] = useState(true);
  // Initialize nickname state as empty string
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [commentText, setCommentText] = useState("");
  const maxLength = 100;

  // Effect to update nickname when language changes or default is selected
  useEffect(() => {
    if (useDefaultNickname) {
      // Use t function directly, assuming TS issue is resolved
      setNickname(t("defaultNickname"));
    }
    // Add t as dependency
  }, [t, useDefaultNickname]);

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseDefaultNickname(false); // User is typing, disable default nickname mode
    setNickname(event.target.value);
  };

  const handleClearNickname = () => {
    setUseDefaultNickname(false);
    setNickname(""); // 닉네임 입력 필드 비우기
  };

  // 사용하지 않는 함수 제거
  // const handleUseDefaultNickname = () => {
  //   setUseDefaultNickname(true);
  //   setNickname(DEFAULT_NICKNAME);
  // };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= maxLength) {
      setCommentText(event.target.value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (commentText.trim() && !disabled) {
      // Use the current nickname state (which should be updated by useEffect)
      onSubmit(commentText.trim(), nickname, password);
      setCommentText("");
      // 비밀번호 필드 초기화는 유지하지 않음 (보통 유지됨)
    }
  };

  // 등록+추천 버튼 핸들러 (임시)
  const handleSubmitWithRecommend = () => {
    if (commentText.trim() && !disabled) {
      console.log("Submit with recommendation (placeholder)"); // Keep console log for now
      // Use the current nickname state (which should be updated by useEffect)
      onSubmit(commentText.trim(), nickname, password);
      setCommentText("");
    }
  };

  // Remove pre-translated variables

  return (
    <form onSubmit={handleSubmit} className={styles.commentInputForm}>
      {/* 왼쪽: 닉네임/비밀번호 */}
      <div className={styles.userInfoColumn}>
        <div className={styles.nicknameSection}>
          {" "}
          {/* Relative positioning 기준 */}
          {useDefaultNickname ? (
            <>
              <input
                type="text"
                value={nickname} // Use nickname state for value
                readOnly
                className={`${styles.nicknameInput} ${styles.defaultNickname}`}
                disabled={disabled}
              />
              {/* 버튼을 input과 같은 레벨에 두지만, CSS로 위치 조정 */}
              <button
                type="button"
                onClick={handleClearNickname}
                className={styles.clearNicknameButton}
                disabled={disabled}
              >
                X
              </button>
            </>
          ) : (
            <>
              {/* 직접 입력 시에는 X 버튼 대신 '갤닉네임 사용' 버튼 표시 */}
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder={t("nicknamePlaceholder")} // Use t() directly
                className={styles.nicknameInput}
                disabled={disabled}
              />
              {/* <button type="button" onClick={handleUseDefaultNickname} className={styles.useGalleryNicknameButton} disabled={disabled}>갤닉네임 사용</button> 제거 */}
            </>
          )}
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("passwordPlaceholder")} // Use t() directly
          className={styles.passwordInput}
          disabled={disabled}
        />
      </div>

      {/* 오른쪽: 텍스트 영역 및 하단 컨트롤 */}
      {/* isReplyMode일 때 스타일 조정이 필요할 수 있음 */}
      <div
        className={`${styles.inputArea} ${
          isReplyMode ? styles.replyInputArea : ""
        }`}
      >
        <textarea
          value={commentText}
          onChange={handleTextChange}
          placeholder={t("textareaPlaceholder")} // Use t() directly
          maxLength={maxLength}
          disabled={disabled}
          className={styles.commentTextarea}
          rows={4}
        />
        <div className={styles.bottomControls}>
          <div className={styles.extraOptions}>
            {/* 디시콘 버튼 제거 */}
            {/* 도움말 아이콘 제거 */}
          </div>
          <div className={styles.submitButtons}>
            <span className={styles.charCount}>
              {commentText.length}/{maxLength}
            </span>
            {/* 대댓글 모드일 때 취소 버튼 표시 */}
            {isReplyMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`${styles.submitButton} ${styles.cancelButton}`}
              >
                {t("cancelButton")} {/* Use t() directly */}
              </button>
            )}
            <button
              type="submit"
              disabled={disabled || !commentText.trim()}
              className={styles.submitButton}
            >
              {t("submitButton")} {/* Use t() directly */}
            </button>
            {/* 대댓글 모드에서는 등록+추천 버튼 숨김 */}
            {!isReplyMode && (
              <button
                type="button"
                onClick={handleSubmitWithRecommend}
                disabled={disabled || !commentText.trim()}
                className={`${styles.submitButton} ${styles.recommendButton}`}
              >
                {t("submitRecommendButton")} {/* Use t() directly */}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
