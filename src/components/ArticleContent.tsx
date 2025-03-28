import React from 'react';
import styles from './ArticleContent.module.css';
import dorimSmile from '../assets/oneroom.png'; // 이미지 import 추가

interface ArticleContentProps {
  // 추후 실제 본문 내용을 받을 props 추가 가능
  title?: string;
  content?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  // title prop은 유지하되, 기본값은 제거하거나 빈 문자열로 변경 가능
  // title = "논란의 중심: AI 창작물, 저작권은 누구에게?",
  content = "NJZ 솔직히 거품 아님? ㅋㅋㅋ 노래는 맨날 비슷비슷하고 라이브는 뭐... 말 안 해도 알지? 민희진 빨 떨어지면 바로 나락 갈 거 같은데 왜 이렇게 빠는지 이해 불가임. 바이럴 마케팅 오지게 돌리는 거 같은데 언제까지 갈지 보자고 ㅋㅋ 반박 시 니 말이 다 맞음.",
}) => {
  return (
    <div className={styles.articleContainer}>
      {/* <h3 className={styles.articleTitle}>{title}</h3> 제목 표시 제거 */}
      {/* 이미지 추가 */}
      <img src={dorimSmile} alt="기사 이미지" className={styles.articleImage} />
      <p className={styles.articleBody}>{content}</p>

      {/* 원본 첨부파일 섹션 추가 */}
      <div className={styles.attachmentSection}>
        <div className={styles.attachmentTitle}>
          원본 첨부파일 <span className={styles.attachmentCount}>1</span>
        </div>
        <div className={styles.attachmentFilename}>placeholder_image.jpg</div>
      </div>
    </div>
  );
};

export default ArticleContent;
