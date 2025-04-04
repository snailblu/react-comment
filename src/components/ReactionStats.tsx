import React from "react";
// import styles from './ReactionStats.module.css'; // 필요시 CSS 모듈 생성

interface ReactionStatsProps {
  likes: number;
  commentsCount: number;
  followers?: number; // 팔로워 수 prop 추가 (옵셔널)
}

const ReactionStats: React.FC<ReactionStatsProps> = ({
  likes,
  commentsCount,
  followers,
}) => {
  return (
    <div className="px-3 pt-2 pb-1 flex items-center gap-4 text-sm border-t border-border">
      {" "}
      {/* 스타일 조정 */}
      {/* 좋아요 */}
      <div className="flex items-center gap-1">
        <span className="font-semibold">{likes}</span>
        <span className="text-muted-foreground">Likes</span>
      </div>
      {/* 댓글 수 */}
      <div className="flex items-center gap-1">
        <span className="font-semibold">{commentsCount}</span>
        <span className="text-muted-foreground">Comments</span>
      </div>
      {/* 팔로워 수 (있을 경우) */}
      {followers !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-semibold">{followers}</span>
          <span className="text-muted-foreground">Followers</span>
        </div>
      )}
    </div>
  );
};

export default ReactionStats;
