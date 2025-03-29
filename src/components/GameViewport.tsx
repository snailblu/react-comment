import React, { useState, useEffect, useRef, ReactNode } from 'react';
import styles from './GameViewport.module.css';

interface GameViewportProps {
  children: ReactNode;
  targetWidth?: number;
  targetHeight?: number;
}

const GameViewport: React.FC<GameViewportProps> = ({
  children,
  targetWidth = 1280, // 기준 너비 (16:9)
  targetHeight = 720, // 기준 높이 (16:9) // 복원
}) => {
  // scale 상태만 유지, offsetX/offsetY 제거
  const [scale, setScale] = useState(1);
  // const [offsetX, setOffsetX] = useState(0); // 제거
  // const [offsetY, setOffsetY] = useState(0); // 제거
  const viewportRef = useRef<HTMLDivElement>(null);

  // useEffect 및 handleResize 로직 수정: scale 계산만 수행
  useEffect(() => {
    const handleResize = () => {
      if (!viewportRef.current) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const targetRatio = targetWidth / targetHeight;
      const windowRatio = windowWidth / windowHeight;

      let newScale = 1;
      // let newOffsetX = 0; // 제거
      // let newOffsetY = 0; // 제거

      if (windowRatio > targetRatio) {
        // Pillarboxing (화면이 기준보다 넓음)
        newScale = windowHeight / targetHeight;
        // const scaledWidth = targetWidth * newScale; // 제거
        // newOffsetX = (windowWidth - scaledWidth) / 2; // 제거
        // newOffsetY = 0; // 제거
      } else {
        // Letterboxing (화면이 기준보다 좁거나 같음)
        newScale = windowWidth / targetWidth;
        // const scaledHeight = targetHeight * newScale; // 제거
        // newOffsetX = 0; // 제거
        // newOffsetY = (windowHeight - scaledHeight) / 2; // 제거
      }

      setScale(newScale);
      // setOffsetX(newOffsetX); // 제거
      // setOffsetY(newOffsetY); // 제거

      // 디버깅 로그 수정: scale 값만 로깅
      console.log(`Window: ${windowWidth}x${windowHeight} (Ratio: ${windowRatio.toFixed(2)})`);
      console.log(`Target: ${targetWidth}x${targetHeight} (Ratio: ${targetRatio.toFixed(2)})`);
      console.log(`Calculated Scale: ${newScale.toFixed(4)}`);
      // console.log(`Applying to container: top=${newOffsetY.toFixed(2)}px, left=${newOffsetX.toFixed(2)}px, scale=${newScale.toFixed(4)}`); // 제거
    };

     // 초기 계산 및 리사이즈 이벤트 리스너 등록
     handleResize();
     window.addEventListener('resize', handleResize);

     // 클린업 함수: 컴포넌트 언마운트 시 리스너 제거
     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, [targetWidth, targetHeight]);

   // 인라인 스타일 수정: width, height, transform: translate + scale, transformOrigin 적용
   const gameContainerStyle: React.CSSProperties = {
     width: `${targetWidth}px`,
     height: `${targetHeight}px`,
     // transform 속성에 translate(-50%, -50%)와 scale 함께 적용
     transform: `translate(-50%, -50%) scale(${scale})`,
     transformOrigin: 'center center', // 스케일 기준점 중앙
     // position, top, left는 CSS에서 처리
   };

  return (
    // viewportRef는 유지
    <div ref={viewportRef} className={styles.viewport}>
      {/* 인라인 스타일 적용 복원 */}
      <div style={gameContainerStyle} className={styles.gameContainer}>
        {children}
      </div>
    </div>
  );
};

export default GameViewport;
