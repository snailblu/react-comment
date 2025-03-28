import React from 'react';
import styles from './ArticleContent.module.css';
// Import images directly from src/assets
import dorimSad from '../assets/dorim_sad.png';
import dorimSmile from '../assets/dorim_smile.png';
import oneroom from '../assets/oneroom.png';

// Define a type for the image map
type ImageMap = {
  [key: string]: string;
};

// Map filenames to imported images
const imageMap: ImageMap = {
  'dorim_sad.png': dorimSad,
  'dorim_smile.png': dorimSmile,
  'oneroom.png': oneroom,
};


interface ArticleContentProps {
  content?: string;
  imageFilename?: string; // 이미지 파일 이름 prop 추가
  // attachmentFilename prop 제거
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  content = "기본 기사 내용입니다. 실제 내용은 missions.json에서 불러옵니다.", // 기본값 변경
  imageFilename, // prop 받기
  // attachmentFilename prop 제거
}) => {
  // Get the imported image source from the map based on the filename
  const imageUrl = imageFilename ? imageMap[imageFilename] : undefined;

  return (
    <div className={styles.articleContainer}>
      {/* 이미지가 있을 경우에만 표시, src에 imported image 사용 */}
      {imageUrl && <img src={imageUrl} alt="기사 이미지" className={styles.articleImage} />}
      <p className={styles.articleBody}>{content}</p>

      {/* 원본 첨부파일 섹션 */}
      <div className={styles.attachmentSection}>
        <div className={styles.attachmentTitle}>
          원본 첨부파일 <span className={styles.attachmentCount}>1</span>
        </div>
        {/* 첨부 파일 이름을 imageFilename으로 표시 (없으면 기본값) */}
        <div className={styles.attachmentFilename}>{imageFilename || 'default_image.png'}</div>
      </div>
    </div>
  );
};

export default ArticleContent;
