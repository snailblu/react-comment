import './App.css';
import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // useNavigate 제거 (현재 사용 안 함)
import GameViewport from './components/GameViewport'; // GameViewport 추가
import StoryScene from './components/StoryScene';
import TitleScreen from './components/TitleScreen';
import CommentScene from './components/CommentScene';
import ResultScene from './components/ResultScene';
// Removed duplicate import: import CommentScene from './components/CommentScene';

function App() {
  // testMissionId 및 handleMissionComplete 제거됨

  return (
    <GameViewport> {/* GameViewport로 감싸기 */}
      {/* className="App" 제거 */}
      {/* 중간 div 제거 */}
      {/* <div className="h-full"> */}
        {/* Set up routes */}
        <Routes>
        {/* 루트 경로를 TitleScreen으로 변경 */}
        <Route path="/" element={<TitleScreen />} />
        {/* CommentScene 라우트 수정 (missionId 및 핸들러 제거 - 추후 필요시 재설정) */}
        <Route path="/comment/:missionId" element={<CommentScene />} /> {/* 예시: missionId를 URL 파라미터로 받도록 변경 */}
        {/* ResultScene 라우트 유지 */}
        <Route path="/result" element={<ResultScene />} />
        {/* EndingScene 라우트 제거 */}
        {/* 기존 /title 경로는 루트로 대체되었으므로 제거 가능 */}
        {/* <Route path="/title" element={<TitleScreen />} /> */}
          <Route path="/game" element={<StoryScene />} />
        </Routes>
      {/* </div> */}
    </GameViewport>
  );
}

export default App;
