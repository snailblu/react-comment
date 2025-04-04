import React, { useEffect } from "react"; // useEffect 추가
import { Link } from "react-router-dom";
import { playBgm, stopBgm } from "../utils/audioManager"; // audioManager 함수 import
// import styles from './TitleScreen.module.css'; // CSS 모듈 사용 중지

function TitleScreen() {
  // BGM 재생/정지 로직 추가
  useEffect(() => {
    playBgm("mainTheme"); // 컴포넌트 마운트 시 mainTheme 재생
    return () => {
      stopBgm(); // 컴포넌트 언마운트 시 BGM 정지
    };
  }, []); // 빈 의존성 배열로 마운트/언마운트 시 한 번만 실행

  return (
    // Neo둥근모 Pro 폰트 적용
    // 배경 이미지 적용 및 중앙 정렬
    <div
      className="relative flex flex-col items-center h-full w-full bg-background text-foreground font-neodgm" // 배경 관련 클래스 수정, style 제거
    >
      {/* 배경 이미지 제거, 기본 배경색 적용 (Tailwind bg-background 등 활용 가능) */}
      {/* 제목 텍스트 */}
      <h1 className="mt-64 text-6xl font-bold text-foreground font-neodgm">
        {" "}
        {/* text-white -> text-foreground */}
        PROJECT COMMENT
      </h1>
      {/* 버튼 (absolute positioning 적용) */}
      <nav className="absolute bottom-[30%] left-1/2 -translate-x-1/2 space-x-4">
        {/* absolute, bottom-[30%], left-1/2, -translate-x-1/2 추가 */}
        {/* 픽셀 아트 스타일 버튼 */}
        <Link
          to="/game"
          className="px-8 py-3 bg-primary text-primary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1" // 픽셀 아트 스타일 적용: 배경, 텍스트, 테두리 색상 변경, 라운딩/그림자 제거, hover/active 효과 조정
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
