import React from "react";
import { Comment } from "../types"; // 게시물 데이터 타입 정의 필요 (임시로 Comment 사용)
// import styles from './InstagramPost.module.css'; // 필요시 CSS 모듈 생성

interface InstagramPostProps {
  post: Comment; // TODO: Post 타입으로 변경 필요
  // TODO: 필요한 props 추가 (예: 댓글 보기 핸들러, 좋아요 핸들러 등)
}

const InstagramPost: React.FC<InstagramPostProps> = ({ post }) => {
  // TODO: 이미지 표시 로직 추가 (post.imageFilename 등 활용)
  const imageUrl = post.content.includes("image.png")
    ? "/assets/oneroom.png"
    : null; // 임시 이미지 로직

  return (
    <div className="border border-border rounded bg-card text-card-foreground overflow-hidden">
      {/* 게시물 헤더 */}
      <div className="flex items-center p-3 border-b border-border">
        {/* TODO: 사용자 프로필 이미지 */}
        <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
        <span className="font-semibold">{post.nickname || "익명"}</span>
        {/* TODO: 옵션 버튼 (...) */}
      </div>

      {/* 게시물 이미지 (있을 경우) */}
      {imageUrl && (
        <img src={imageUrl} alt="게시물 이미지" className="w-full h-auto" />
      )}

      {/* 게시물 내용 및 액션 버튼 */}
      <div className="p-3">
        <p className="mb-2">{post.content}</p>
        <div className="flex items-center gap-3 text-muted-foreground">
          {/* TODO: 좋아요, 댓글, 공유, 저장 아이콘 버튼 */}
          <button>❤️</button>
          <button>💬</button>
          <button>➤</button>
          <button className="ml-auto">🔖</button>
        </div>
      </div>

      {/* 좋아요 수 */}
      {post.likes > 0 && (
        <div className="px-3 pb-1 text-sm font-semibold">
          좋아요 {post.likes}개
        </div>
      )}

      {/* TODO: 댓글 미리보기 또는 댓글 섹션 */}

      {/* 게시 시간 */}
      <div className="px-3 pb-3 text-xs text-muted-foreground">
        {new Date(post.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default InstagramPost;
