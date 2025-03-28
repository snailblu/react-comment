import React from 'react';
import { Link } from 'react-router-dom';
// import styles from './TitleScreen.module.css'; // CSS 모듈 사용 중지

function TitleScreen() {
  return (
    // Playfair Display 폰트 적용
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-gray-700 via-gray-900 to-black text-gray-300 py-60 font-playfair">
      {/* 은은한 보라색 계열 그라데이션 제목 */}
      <h1 className="text-6xl font-bold animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400">
        Project Comment
      </h1>
      {/* 버튼을 하단으로 이동 */}
      <nav className="space-x-4">
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
