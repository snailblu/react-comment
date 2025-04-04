import React from "react";
// import styles from './ReactionStats.module.css'; // 필요시 CSS 모듈 생성

interface ReactionStatsProps {
  likes: number;
  commentsCount: number;
  // TODO: 팔로워 수 등 필요한 props 추가
}

const ReactionStats: React.FC<ReactionStatsProps> = ({
  likes,
  commentsCount,
}) => {
  return (
    <div className="p-3 flex items-center gap-4 text-sm">
      {/* TODO: 아이콘 추가 및 스타일링 */}
      <div>
        <span className="font-semibold">{likes}</span> Likes
      </div>
      <div>
        <span className="font-semibold">{commentsCount}</span> Comments
      </div>
      {/* TODO: 팔로워 수 표시 */}
    </div>
  );
};

export default ReactionStats;
