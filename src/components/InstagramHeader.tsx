import React from "react";
import { PlusSquare, Heart, Send } from "lucide-react"; // PlusSquare import 추가
// import styles from './InstagramHeader.module.css'; // 필요시 CSS 모듈 생성

// Instagram Header Component Props
interface InstagramHeaderProps {
  // TODO: 필요한 props 정의 (예: 사용자 프로필 정보 등)
}

const InstagramHeader: React.FC<InstagramHeaderProps> = (props) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-3 border-b border-border bg-background">
      {/* TODO: 인스타그램 헤더 UI 구현 (로고, 검색창, 아이콘 등) */}
      {/* 로고/타이틀 */}
      <div className="text-lg font-semibold font-neodgm">InstaLife</div>{" "}
      {/* TODO: Instagram 로고 이미지로 변경 고려 */}
      {/* 오른쪽 아이콘들 */}
      <div className="flex items-center gap-4">
        <button className="hover:text-foreground">
          <PlusSquare size={24} /> {/* 게시물 추가 아이콘 */}
        </button>
        <button className="hover:text-foreground">
          <Heart size={24} /> {/* 활동/알림 아이콘 */}
        </button>
        <button className="hover:text-foreground">
          <Send size={24} /> {/* DM 아이콘 */}
        </button>
      </div>
    </header>
  );
};

export default InstagramHeader;
