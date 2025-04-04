import React from "react";
// import styles from './InstagramHeader.module.css'; // 필요시 CSS 모듈 생성

// Instagram Header Component Props
interface InstagramHeaderProps {
  // TODO: 필요한 props 정의 (예: 사용자 프로필 정보 등)
}

const InstagramHeader: React.FC<InstagramHeaderProps> = (props) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-3 border-b border-border bg-background">
      {/* TODO: 인스타그램 헤더 UI 구현 (로고, 검색창, 아이콘 등) */}
      <div className="text-lg font-semibold font-neodgm">InstaLife</div>
      <div>
        {/* 임시 아이콘 */}
        <span>🔍</span>
        <span>❤️</span>
        <span>👤</span>
      </div>
    </header>
  );
};

export default InstagramHeader;
