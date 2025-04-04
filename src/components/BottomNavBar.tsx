import React from "react";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
// import styles from './BottomNavBar.module.css'; // 필요시 CSS 모듈 생성

const BottomNavBar: React.FC = () => {
  // TODO: 각 아이콘 클릭 시 라우팅 또는 기능 연결 필요
  return (
    <footer className="sticky bottom-0 flex justify-around items-center p-3 border-t border-border bg-background">
      <button className="p-2 hover:bg-accent rounded">
        <Home size={24} />
      </button>
      <button className="p-2 hover:bg-accent rounded">
        <Search size={24} />
      </button>
      <button className="p-2 hover:bg-accent rounded">
        <PlusSquare size={24} />
      </button>
      <button className="p-2 hover:bg-accent rounded">
        <Heart size={24} />
      </button>
      <button className="p-2 hover:bg-accent rounded">
        <User size={24} />
      </button>
    </footer>
  );
};

export default BottomNavBar;
