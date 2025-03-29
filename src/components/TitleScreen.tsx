import React from 'react';
import { Link } from 'react-router-dom';
// import styles from './TitleScreen.module.css'; // CSS 모듈 사용 중지

function TitleScreen() {
  return (
    // Playfair Display 폰트 적용
    // justify-between/패딩 제거, relative 추가, 버튼 absolute positioning
    <div className="relative flex flex-col items-center h-full w-full bg-gradient-to-br from-gray-700 via-gray-900 to-black text-gray-300 font-playfair"> {/* justify-between, pt/pb 제거, relative 추가 */}
      {/* 제목 (상단 마진 유지) */}
      <h1 className="text-7xl font-bold animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400 mt-64"> {/* mt-24 유지 */}
        Project Comment
      </h1>
      {/* 버튼 (absolute positioning 적용) */}
      <nav className="absolute bottom-[30%] left-1/2 -translate-x-1/2 space-x-4"> {/* absolute, bottom-[30%], left-1/2, -translate-x-1/2 추가 */}
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
