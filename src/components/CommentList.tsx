import React, { useEffect, useRef } from 'react';
// import styles from './CommentList.module.css';

// 댓글 데이터 구조 정의 (comments 테이블 스키마 기반)
interface Comment {
  id: string;
  content: string;
  likes: number;
  is_player: boolean;
  created_at: string; // 또는 Date 타입
  // 필요시 다른 필드 추가 (예: 작성자 닉네임 등)
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const listEndRef = useRef<HTMLDivElement>(null);

  // 새 댓글 추가 시 스크롤을 맨 아래로 이동
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
    <div /* className={styles.commentListContainer} */>
      <h4>댓글 목록</h4>
      {comments.length === 0 ? (
        <p>아직 댓글이 없습니다.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} /* className={comment.is_player ? styles.playerComment : styles.npcComment} */>
              <p>{comment.content}</p>
              <span>좋아요: {comment.likes}</span>
              {/* <small>{new Date(comment.created_at).toLocaleString()}</small> */}
            </li>
          ))}
        </ul>
      )}
      {/* 스크롤 타겟용 빈 div */}
      <div ref={listEndRef} />
    </div>
  );
};

export default CommentList;
