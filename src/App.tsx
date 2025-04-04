import "./App.css";
import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom"; // useNavigate 제거 (현재 사용 안 함)
import GameViewport from "./components/GameViewport"; // GameViewport 추가
import StoryScene from "./components/StoryScene";
import TitleScreen from "./components/TitleScreen";
import CommentScene from "./components/CommentScene"; // 기존 댓글 씬
import InstagramActivityScene from "./components/InstagramActivityScene"; // 새로 추가된 인스타그램 씬
import ResultScene from "./components/ResultScene";

function App() {
  // testMissionId 및 handleMissionComplete 제거됨

  return (
    <GameViewport>
      {" "}
      {/* GameViewport로 감싸기 */}
      {/* className="App" 제거 */}
      {/* 중간 div 제거 */}
      {/* <div className="h-full"> */}
      {/* Set up routes */}
      <Routes>
        {/* 루트 경로를 TitleScreen으로 변경 */}
        <Route path="/" element={<TitleScreen />} />
        {/* 기존 CommentScene 라우트 유지 */}
        <Route path="/comment/:missionId" element={<CommentScene />} />
        {/* 새로운 InstagramActivityScene 라우트 추가 */}
        <Route
          path="/instagram/:missionId"
          element={<InstagramActivityScene />}
        />
        {/* ResultScene 라우트 유지 */}
        <Route path="/result" element={<ResultScene />} />
        {/* 기존 /title 경로는 루트로 대체되었으므로 제거 가능 */}
        {/* <Route path="/title" element={<TitleScreen />} /> */}
        <Route path="/game" element={<StoryScene />} />
      </Routes>
      {/* </div> */}
    </GameViewport>
  );
}

export default App;
