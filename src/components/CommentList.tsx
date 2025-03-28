import React, { useEffect, useRef } from 'react';
import styles from './CommentList.module.css'; // CSS 모듈 import

// 댓글 데이터 구조 정의
interface Comment {
  id: string;
  nickname?: string; // 닉네임 추가
  ip?: string; // IP 추가
  isReply?: boolean; // 대댓글 여부 추가
  content: string;
  likes: number;
  is_player: boolean;
  created_at: string; // 또는 Date 타입
}

interface CommentListProps {
  comments: Comment[];
  isVisible: boolean; // isVisible prop 추가
}

// 시간 포맷 함수 (yy.mm.dd hh:mm:ss)
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${yy}.${mm}.${dd} ${hh}:${min}:${ss}`;
};


const CommentList: React.FC<CommentListProps> = ({ comments, isVisible }) => { // isVisible prop 받기
  const listEndRef = useRef<HTMLLIElement>(null);

  // 새 댓글 추가 시 스크롤 (isVisible이 true일 때만 실행되도록)
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined; // timer 변수 타입 명시 및 초기화
    if (isVisible) { // isVisible 조건 추가
      // 약간의 딜레이 후 스크롤해야 애니메이션과 자연스럽게 연동될 수 있음
      timer = setTimeout(() => { // timer에 할당
        listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100); // 100ms 딜레이
    }
    // cleanup 함수: 컴포넌트 언마운트 또는 의존성 변경 시 timer 클리어
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [comments, isVisible]); // isVisible 의존성 추가

  // isVisible 값에 따라 렌더링 결정
  if (!isVisible) {
    return null; // 또는 <div className={styles.hiddenPlaceholder}>댓글 숨김</div> 같은 플레이스홀더
  }

  return (
    <div className={styles.commentListContainer}>
      {comments.length === 0 ? (
        <p className={styles.noComments}>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((comment) => (
            <li
              key={comment.id}
              // isReply 값에 따라 replyComment 클래스 추가, playerComment 클래스 제거
              className={`${styles.commentItem} ${comment.isReply ? styles.replyComment : ''}`}
            >
               {/* 작성자 정보 (닉네임 + IP 앞 두자리) */}
               <div className={styles.authorInfo}>
                 {/* 플레이어 구분 없이 닉네임 또는 'ㅇㅇ' 표시 */}
                 {comment.nickname || 'ㅇㅇ'}
                 {/* IP 주소 앞 두 자리만 추출하여 표시 */}
                 {comment.ip && <span className={styles.ipAddress}>({comment.ip.split('.').slice(0, 2).join('.')})</span>}
               </div>
               {/* 댓글 내용 (대댓글이면 'ㄴ' 추가) */}
               <p className={styles.commentText}>
                {comment.isReply && <span className={styles.replyPrefix}>ㄴ</span>}
                {comment.content}
              </p>
              {/* 메타 정보 (시간 + 삭제 버튼) */}
              <div className={styles.commentMeta}>
                <span className={styles.timestamp}>{formatDateTime(comment.created_at)}</span>
                <button className={styles.deleteButton}>X</button>
              </div>
               {/* commentBody 제거됨 */}
            </li>
          ))}
          {/* 스크롤 타겟용 빈 div */}
          <li ref={listEndRef} className={styles.scrollTarget} aria-hidden="true" />
        </ul>
      )}
    </div>
  );
};

export default CommentList;
