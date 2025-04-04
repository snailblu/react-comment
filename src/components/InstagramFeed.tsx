import React from "react";
import { Comment } from "../types"; // 게시물 데이터 타입 정의 필요 (임시로 Comment 사용)
// import InstagramPost from "./InstagramPost"; // 개별 게시물 컴포넌트 (아직 없음)
// import styles from './InstagramFeed.module.css'; // 필요시 CSS 모듈 생성

interface InstagramFeedProps {
  posts: Comment[]; // TODO: Post 타입으로 변경 필요
}

const InstagramFeed: React.FC<InstagramFeedProps> = ({ posts }) => {
  return (
    <div className="flex flex-col gap-4 p-3">
      {/* TODO: InstagramPost 컴포넌트를 사용하여 게시물 목록 렌더링 */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 border border-border rounded bg-card text-card-foreground"
        >
          {/* 임시 게시물 표시 */}
          <p className="font-semibold">{post.nickname || "익명"}</p>
          <p>{post.content}</p>
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>좋아요 {post.likes}개</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <p className="text-center text-muted-foreground">
          표시할 게시물이 없습니다.
        </p>
      )}
    </div>
  );
};

export default InstagramFeed;
