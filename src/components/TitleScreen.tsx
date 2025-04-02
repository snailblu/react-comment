import React from "react";
import { Link } from "react-router-dom";
// import styles from './TitleScreen.module.css'; // CSS 모듈 사용 중지

function TitleScreen() {
  return (
    // Playfair Display 폰트 적용
    // 배경 이미지 적용 및 중앙 정렬
    <div
      className="relative flex flex-col items-center h-full w-full bg-cover bg-center bg-no-repeat text-gray-300 font-playfair"
      style={{ backgroundImage: `url('/title_background.png')` }}
    >
      {/* 제목 이미지 (상단 마진 유지) */}
      <img
        src="/title.png"
        alt="Project Comment Title"
        className="mt-64 w-auto h-48" // 이미지 높이를 h-48로 늘림
      />
      {/* 버튼 (absolute positioning 적용) */}
      <nav className="absolute bottom-[30%] left-1/2 -translate-x-1/2 space-x-4">
        {/* absolute, bottom-[30%], left-1/2, -translate-x-1/2 추가 */}
        {/* 진한 회색 버튼 */}
        <Link
          to="/game"
          className="px-8 py-3 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-600"
        >
          게임 시작
        </Link>
        {/* 선택 사항: 불러오기, 설정 버튼 (Tailwind 스타일 적용) */}
        {/*
        <button
          className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md cursor-not-allowed"
          disabled
        >
          불러오기
        </button>
        <button
          className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md cursor-not-allowed"
          disabled
        >
          설정
        </button>
        */}
      </nav>
    </div>
  );
}

export default TitleScreen;
