import React, { useState } from 'react';
// import styles from './CommentInput.module.css';

interface CommentInputProps {
  onSubmit: (commentText: string) => void; // 댓글 제출 시 호출될 함수
  disabled?: boolean; // 입력 비활성화 여부
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit, disabled = false }) => {
  const [commentText, setCommentText] = useState('');
  const maxLength = 100; // 댓글 최대 길이 제한 (예시)

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= maxLength) {
      setCommentText(event.target.value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 폼 기본 제출 동작 방지
    if (commentText.trim() && !disabled) {
      onSubmit(commentText.trim());
      setCommentText(''); // 제출 후 입력 필드 초기화
    }
  };

  return (
    <form onSubmit={handleSubmit} /* className={styles.commentInputForm} */>
      <textarea
        value={commentText}
        onChange={handleChange}
        placeholder="댓글을 입력하세요..."
        maxLength={maxLength}
        disabled={disabled}
        // className={styles.commentTextarea}
        rows={3} // 예시 행 수
      />
      <div /* className={styles.inputControls} */>
        <span>{commentText.length}/{maxLength}</span>
        <button type="submit" disabled={disabled || !commentText.trim()} /* className={styles.submitButton} */>
          댓글 작성
        </button>
      </div>
    </form>
  );
};

export default CommentInput;
