import React, { useState } from "react"; // useState import 추가
import { Comment } from "../types";
// import styles from './InstagramCommentList.module.css'; // 필요시 CSS 모듈 생성

interface InstagramCommentListProps {
  comments: Comment[];
  onReplySubmit: (
    replyContent: string,
    parentId: string,
    nickname?: string
  ) => void; // 답글 제출 핸들러
  // TODO: 필요한 props 추가 (예: 좋아요 핸들러, 현재 사용자 ID 등)
}

// 재귀적으로 댓글과 대댓글을 렌더링하는 컴포넌트
const CommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  onReplySubmit: InstagramCommentListProps["onReplySubmit"];
  level: number;
}> = ({ comment, allComments, onReplySubmit, level }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const handleReplySubmitInternal = () => {
    if (!replyText.trim()) return;
    // TODO: 실제 닉네임 처리 필요
    onReplySubmit(
      replyText,
      comment.id,
      `익명${Math.floor(Math.random() * 100)}`
    );
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="mb-2">
      {" "}
      {/* 들여쓰기 적용 */}
      <div className="text-sm">
        <span className="font-semibold mr-1">{comment.nickname || "익명"}</span>
        <span>{comment.content}</span>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span>
            {new Date(comment.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {/* TODO: 좋아요 버튼 구현 */}
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="hover:text-foreground"
          >
            {showReplyInput ? "취소" : "답글 달기"}
          </button>
        </div>
      </div>
      {/* 답글 입력창 */}
      {showReplyInput && (
        <div className="mt-1 flex gap-1">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="답글 입력..."
            className="flex-1 p-1 border border-input rounded bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleReplySubmitInternal}
            className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            disabled={!replyText.trim()}
          >
            등록
          </button>
        </div>
      )}
      {/* 대댓글 렌더링 */}
      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              onReplySubmit={onReplySubmit}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InstagramCommentList: React.FC<InstagramCommentListProps> = ({
  comments,
  onReplySubmit,
}) => {
  // 최상위 댓글만 필터링
  const topLevelComments = comments.filter((comment) => !comment.parentId);

  return (
    <div className="p-3 space-y-3 border-t border-border">
      {" "}
      {/* 상단 구분선 추가 */}
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          allComments={comments}
          onReplySubmit={onReplySubmit}
          level={0}
        />
      ))}
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          아직 댓글이 없습니다.
        </p>
      )}
    </div>
  );
};

export default InstagramCommentList;
