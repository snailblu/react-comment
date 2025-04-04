import React, { useState, useEffect, useRef, ReactNode } from "react";
import styles from "./GameViewport.module.css";

interface GameViewportProps {
  children: ReactNode;
  targetWidth?: number;
  targetHeight?: number;
}

const GameViewport: React.FC<GameViewportProps> = ({
  children,
  targetWidth = 800, // 기준 너비 (4:3 비율에 가까움)
  targetHeight = 600, // 기준 높이 (4:3 비율에 가까움)
}) => {
  // scale 상태 복원
  const [scale, setScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);

  // 스케일 계산 로직 수정: 정수 배율 적용
  useEffect(() => {
    const handleResize = () => {
      if (!viewportRef.current) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const targetRatio = targetWidth / targetHeight;
      const windowRatio = windowWidth / windowHeight;

      let newScale = 1;

      if (windowRatio > targetRatio) {
        // Pillarboxing (화면이 기준보다 넓음)
        newScale = windowHeight / targetHeight;
      } else {
        // Letterboxing (화면이 기준보다 좁거나 같음)
        newScale = windowWidth / targetWidth;
      }

      // 계산된 스케일 값을 가장 가까운 정수로 내림하여 적용
      const integerScale = Math.max(1, Math.floor(newScale)); // 최소 1배율 보장
      setScale(integerScale);

      // 디버깅 로그는 제거된 상태 유지
    };

    // 초기 계산 및 리사이즈 이벤트 리스너 등록
    handleResize();
    window.addEventListener("resize", handleResize);

    // 클린업 함수: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [targetWidth, targetHeight]);

  // 인라인 스타일 수정: scale 복원
  const gameContainerStyle: React.CSSProperties = {
    width: `${targetWidth}px`,
    height: `${targetHeight}px`,
    transform: `translate(-50%, -50%) scale(${scale})`, // scale 복원
    transformOrigin: "center center",
  };

  return (
    <div ref={viewportRef} className={styles.viewport}>
      <div style={gameContainerStyle} className={styles.gameContainer}>
        {children}
      </div>
    </div>
  );
};

export default GameViewport;
