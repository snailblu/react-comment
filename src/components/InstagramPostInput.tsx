import React, { useState } from "react"; // 중복 import 제거 및 useState 추가
// import styles from './InstagramPostInput.module.css'; // 필요시 CSS 모듈 생성

interface InstagramPostInputProps {
  onSubmitComment: (commentText: string) => void; // 댓글 제출 핸들러 prop 정의
  disabled?: boolean;
}

const InstagramPostInput: React.FC<InstagramPostInputProps> = ({
  onSubmitComment,
  disabled,
}) => {
  const [commentText, setCommentText] = useState(""); // 댓글 입력 상태

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || disabled) return;
    onSubmitComment(commentText);
    setCommentText(""); // 입력 필드 초기화
  };

  return (
    // form 태그로 변경하여 Enter 키로 제출 가능하게
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-3 border-t border-border gap-2"
    >
      {/* TODO: 사용자 프로필 이미지 (작게) */}
      <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0"></div>
      <input
        type="text"
        placeholder="댓글 달기..."
        value={commentText}
        onChange={handleInputChange}
        className="flex-1 p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm" // text-sm 추가
        disabled={disabled}
      />
      <button
        type="submit"
        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50" // 크기 및 스타일 조정
        disabled={!commentText.trim() || disabled}
      >
        게시
      </button>
    </form>
  );
};

export default InstagramPostInput;
