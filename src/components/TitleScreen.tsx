import React, { useState, useEffect } from "react"; // Import useState
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { playBgm, stopBgm } from "../utils/audioManager";
import SettingsMenu from "./SettingsMenu"; // Import SettingsMenu

function TitleScreen() {
  // Specify namespace
  const { t } = useTranslation("titleScreen");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for settings menu

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
          className="px-8 py-3 bg-primary text-primary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          {t("startGame")} {/* Use key without namespace */}
        </Link>
        {/* 선택 사항: 불러오기 버튼 (주석 처리 유지) */}
        {/*
        <button
          className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md cursor-not-allowed"
          disabled
        >
          불러오기
        </button>
        */}
        {/* 설정 버튼 활성화 */}
        <button
          onClick={() => setIsSettingsOpen(true)} // Open settings menu
          className="px-8 py-3 bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1" // Apply similar styling
        >
          {t("settingsButton")} {/* Use translation key */}
        </button>
      </nav>
      {/* 설정 메뉴 조건부 렌더링 */}
      {isSettingsOpen && (
        <SettingsMenu onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

export default TitleScreen;
