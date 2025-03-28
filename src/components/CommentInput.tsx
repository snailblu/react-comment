import React, { useState } from 'react';
import styles from './CommentInput.module.css';

interface CommentInputProps {
  onSubmit: (commentText: string, nickname?: string, password?: string) => void; // 닉네임, 비밀번호 추가 (선택적)
  disabled?: boolean; // 입력 비활성화 여부
}

const DEFAULT_NICKNAME = '연갤러'; // 기본값 변경

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit, disabled = false }) => {
  const [useDefaultNickname, setUseDefaultNickname] = useState(true); // 갤닉 사용 여부 상태
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [password, setPassword] = useState('');
  const [commentText, setCommentText] = useState('');
  const maxLength = 100;

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleClearNickname = () => {
    setUseDefaultNickname(false);
    setNickname(''); // 닉네임 입력 필드 비우기
  };

  const handleUseDefaultNickname = () => {
    setUseDefaultNickname(true);
    setNickname(DEFAULT_NICKNAME);
  };


  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= maxLength) {
      setCommentText(event.target.value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (commentText.trim() && !disabled) {
      // onSubmit에 실제 사용할 닉네임 전달
      const finalNickname = useDefaultNickname ? DEFAULT_NICKNAME : nickname;
      onSubmit(commentText.trim(), finalNickname, password);
      setCommentText('');
      // 비밀번호 필드 초기화는 유지하지 않음 (보통 유지됨)
    }
  };

  // 등록+추천 버튼 핸들러 (임시)
  const handleSubmitWithRecommend = () => {
    if (commentText.trim() && !disabled) {
      console.log('Submit with recommendation (placeholder)');
      const finalNickname = useDefaultNickname ? DEFAULT_NICKNAME : nickname;
      onSubmit(commentText.trim(), finalNickname, password);
      setCommentText('');
    }
  };


  return (
    <form onSubmit={handleSubmit} className={styles.commentInputForm}>
      {/* 왼쪽: 닉네임/비밀번호 */}
      <div className={styles.userInfoColumn}>
        <div className={styles.nicknameSection}> {/* Relative positioning 기준 */}
          {useDefaultNickname ? (
            <>
              <input
                type="text"
                value={DEFAULT_NICKNAME}
                readOnly
                className={`${styles.nicknameInput} ${styles.defaultNickname}`}
                disabled={disabled}
              />
              {/* 버튼을 input과 같은 레벨에 두지만, CSS로 위치 조정 */}
              <button type="button" onClick={handleClearNickname} className={styles.clearNicknameButton} disabled={disabled}>X</button>
            </>
          ) : (
            <>
              {/* 직접 입력 시에는 X 버튼 대신 '갤닉네임 사용' 버튼 표시 */}
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임"
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
          placeholder="비밀번호"
          className={styles.passwordInput}
          disabled={disabled}
        />
      </div>

      {/* 오른쪽: 텍스트 영역 및 하단 컨트롤 */}
      <div className={styles.inputArea}>
        <textarea
          value={commentText}
          onChange={handleTextChange}
          placeholder="타인의 권리를 침해하거나 명예를 훼손하는 댓글은 운영원칙 및 관련 법률에 제재를 받을 수 있습니다. Shift+Enter 키를 동시에 누르면 줄바꿈이 됩니다."
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
            <span className={styles.charCount}>{commentText.length}/{maxLength}</span>
            <button type="submit" disabled={disabled || !commentText.trim()} className={styles.submitButton}>
              등록
            </button>
            <button type="button" onClick={handleSubmitWithRecommend} disabled={disabled || !commentText.trim()} className={`${styles.submitButton} ${styles.recommendButton}`}>
              등록+추천
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
