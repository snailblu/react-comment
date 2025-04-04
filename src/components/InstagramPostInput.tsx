import React, { useState } from "react";
// import styles from './InstagramPostInput.module.css'; // 필요시 CSS 모듈 생성

interface InstagramPostInputProps {
  onSubmit: (content: string, image?: string) => void; // 게시물 내용과 이미지(옵션) 전달
  disabled?: boolean;
}

const InstagramPostInput: React.FC<InstagramPostInputProps> = ({
  onSubmit,
  disabled,
}) => {
  const [content, setContent] = useState("");
  // TODO: 이미지 선택 상태 관리 추가
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    // TODO: 선택된 이미지 정보도 함께 전달
    onSubmit(content);
    setContent(""); // 입력 필드 초기화
    // setSelectedImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-border">
      {/* TODO: 사용자 프로필 이미지 */}
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
        <span className="font-semibold">플레이어</span> {/* 임시 사용자 이름 */}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="문구 입력..."
        className="w-full p-2 border border-input rounded bg-background text-foreground resize-none mb-2 focus:outline-none focus:ring-1 focus:ring-ring"
        rows={3}
        disabled={disabled}
      />
      <div className="flex justify-between items-center">
        <div>
          {/* TODO: 이미지 선택 버튼 */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            🖼️ 이미지 추가
          </button>
        </div>
        <button
          type="submit"
          className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          disabled={!content.trim() || disabled}
        >
          게시
        </button>
      </div>
    </form>
  );
};

export default InstagramPostInput;
