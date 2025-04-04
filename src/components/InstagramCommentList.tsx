import React from "react";
import { Comment } from "../types";
// import styles from './InstagramCommentList.module.css'; // 필요시 CSS 모듈 생성

interface InstagramCommentListProps {
  comments: Comment[];
  onReplySubmit: (
    replyContent: string,
    parentId: string,
    nickname?: string
  ) => void; // 답글 제출 핸들러
  // TODO: 필요한 props 추가 (예: 좋아요 핸들러 등)
}

const InstagramCommentList: React.FC<InstagramCommentListProps> = ({
  comments,
  onReplySubmit,
}) => {
  // TODO: 댓글 렌더링 로직 구현 (대댓글 들여쓰기 등)
  return (
    <div className="p-3 space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="text-sm">
          <span className="font-semibold mr-1">
            {comment.nickname || "익명"}
          </span>
          <span>{comment.content}</span>
          {/* TODO: 답글 달기, 좋아요 등 인터랙션 UI 추가 */}
          <div className="text-xs text-muted-foreground mt-1">
            <span>{new Date(comment.created_at).toLocaleTimeString()}</span>
            <button className="ml-2 hover:text-foreground">답글 달기</button>
          </div>
          {/* TODO: 대댓글 렌더링 */}
        </div>
      ))}
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
      )}
    </div>
  );
};

export default InstagramCommentList;
