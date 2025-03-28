import './App.css';
import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Game from './components/Game';
import TitleScreen from './components/TitleScreen'; // Import TitleScreen
import CommentScene from './components/CommentScene'; // CommentScene import 추가

function App() {
  // 테스트용 미션 ID
  const testMissionId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  // 임시 미션 완료 핸들러
  const handleMissionComplete = (success: boolean) => {
    alert(`미션 ${success ? '성공' : '실패'}! (임시 메시지)`);
    // TODO: 실제로는 결과 씬으로 이동하거나 다음 에피소드로 진행
  };

  return (
    <div className="App">
      {/* Set up routes */}
      <Routes>
        {/* 루트 경로를 CommentScene으로 변경 (테스트용) */}
        <Route
          path="/"
          element={<CommentScene missionId={testMissionId} onMissionComplete={handleMissionComplete} />}
        />
        {/* 기존 경로 유지 (필요시 접근 가능) */}
        <Route path="/title" element={<TitleScreen />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  );
}

export default App;
