import React from 'react';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react'; // 아이콘 추가
import styles from './ArticleReactions.module.css'; // CSS 모듈 import

interface ArticleReactionsProps {
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
}

const ArticleReactions: React.FC<ArticleReactionsProps> = ({ likes, dislikes, onLike, onDislike }) => {
  return (
    <div className={styles.reactionsContainer}>
      <span className={styles.likeCount}>{likes}</span>
      <Button variant="ghost" size="icon" onClick={onLike} className={styles.likeButton}>
        {/* <ThumbsUp className="h-6 w-6" /> */}
        <Star className="h-6 w-6 fill-current" /> {/* 별 아이콘으로 변경 및 채우기 */}
        <span className={styles.buttonText}>개념</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onDislike} className={styles.dislikeButton}>
        <ThumbsDown className="h-6 w-6" />
        <span className={styles.buttonText}>비추</span>
      </Button>
      <span className={styles.dislikeCount}>{dislikes}</span>
    </div>
  );
};

export default ArticleReactions;
