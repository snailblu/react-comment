import React, { useState } from "react"; // useState import 추가
import { Button } from "./ui/button";
import { ThumbsDown, Star } from "lucide-react"; // 아이콘 추가 (ThumbsUp 제거)
import styles from "./ArticleReactions.module.css"; // CSS 모듈 import

interface ArticleReactionsProps {
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
}

const ArticleReactions: React.FC<ArticleReactionsProps> = ({
  likes,
  dislikes,
  onLike,
  onDislike,
}) => {
  const [liked, setLiked] = useState(false); // 개념 버튼 클릭 상태
  const [disliked, setDisliked] = useState(false); // 비추 버튼 클릭 상태

  const handleLike = () => {
    if (liked || disliked) {
      // 이미 개념 또는 비추를 눌렀다면
      alert("개념/비추는 하루에 한 번만 가능합니다");
    } else {
      setLiked(true);
      onLike();
    }
  };

  const handleDislike = () => {
    if (liked || disliked) {
      // 이미 개념 또는 비추를 눌렀다면
      alert("개념/비추는 하루에 한 번만 가능합니다");
    } else {
      setDisliked(true);
      onDislike();
    }
  };

  return (
    <div className={styles.reactionsContainer}>
      <span className={styles.likeCount}>{likes}</span>
      {/* onClick 핸들러 변경, disabled 속성 및 관련 className 제거 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLike}
        className={styles.likeButton}
      >
        {/* <ThumbsUp className="h-6 w-6" /> */}
        <Star className="h-6 w-6 fill-current" />{" "}
        {/* 별 아이콘으로 변경 및 채우기 */}
        <span className={styles.buttonText}>개념</span>
      </Button>
      {/* onClick 핸들러 변경, disabled 속성 및 관련 className 제거 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDislike}
        className={styles.dislikeButton}
      >
        <ThumbsDown className="h-6 w-6" />
        <span className={styles.buttonText}>비추</span>
      </Button>
      <span className={styles.dislikeCount}>{dislikes}</span>
    </div>
  );
};

export default ArticleReactions;
