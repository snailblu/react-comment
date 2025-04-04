import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Comment } from "../types";
// import styles from './InstagramCommentList.module.css';

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
  const { t } = useTranslation("instagramCommentList"); // Initialize useTranslation
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const handleReplySubmitInternal = () => {
    if (!replyText.trim()) return;
    // TODO: 실제 닉네임 처리 필요, 일단 번역된 'anonymous' 사용
    onReplySubmit(
      replyText,
      comment.id,
      t("anonymous") // Use translated anonymous
    );
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    // 최상위 div에서 flex 제거, mb-2 유지
    <div style={{ marginLeft: `${level * 20}px` }} className="mb-2">
      <div className="flex items-start gap-2">
        {" "}
        {/* 이미지와 내용을 묶는 flex 컨테이너 추가 */}
        {/* 프로필 이미지 */}
        <img
          src={comment.profileImageUrl || "/default_profile_icon.png"}
          alt={comment.nickname || t("anonymous")} // Use translated anonymous for alt
          className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
        />
        {/* 댓글 내용 */}
        <div className="text-sm flex-1">
          {" "}
          {/* flex-1 추가 */}
          <div>
            {" "}
            {/* 닉네임과 내용 묶기 */}
            <span className="font-semibold mr-1">
              {comment.nickname || t("anonymous")}{" "}
              {/* Use translated anonymous for nickname */}
            </span>
            <span>{comment.content}</span>
          </div>
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
              {showReplyInput ? t("cancelReply") : t("addReply")}{" "}
              {/* Translate button text */}
            </button>
          </div>
        </div>
      </div>{" "}
      {/* 댓글 내용 div 닫기 */}
      {/* 답글 입력창 (댓글 내용 div 밖으로 이동 및 들여쓰기 적용) */}
      {showReplyInput && (
        <div className="mt-1 flex gap-1 pl-8">
          {" "}
          {/* pl-8 = w-6 (이미지) + gap-2 */}
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t("replyPlaceholder")} // Translate placeholder
            className="flex-1 p-1 border border-input rounded bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleReplySubmitInternal}
            className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            disabled={!replyText.trim()}
          >
            {t("submitReply")} {/* Translate button text */}
          </button>
        </div>
      )}
      {/* 대댓글 렌더링 */}
      {replies.length > 0 && (
        <div className="mt-2">
          {" "}
          {/* 대댓글 영역은 부모의 들여쓰기를 따름 */}
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
  const { t } = useTranslation("instagramCommentList"); // Initialize useTranslation here as well
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
          {t("noCommentsYet")} {/* Translate message */}
        </p>
      )}
    </div>
  );
};

export default InstagramCommentList;
