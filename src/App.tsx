import './App.css';
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // useNavigate 추가
import Game from './components/Game';
import TitleScreen from './components/TitleScreen';
import CommentScene from './components/CommentScene';
import ResultScene from './components/ResultScene'; // ResultScene import 추가
import EndingScene from './components/EndingScene'; // EndingScene import 추가

function App() {
  const navigate = useNavigate(); // useNavigate 훅 사용

  // 테스트용 미션 ID
  const testMissionId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

  // 미션 완료 핸들러 수정
  const handleMissionComplete = (success: boolean) => {
    console.log(`Mission Complete: ${success}`);
    if (success) {
      // 성공 시 ResultScene으로 이동 (missionId 전달)
      navigate('/result', { state: { missionId: testMissionId } });
    } else {
      // 실패 시 EndingScene으로 이동 (bad_ending 타입 전달)
      navigate('/ending', { state: { endingType: 'bad_ending' } });
    }
  };

  return (
    <div className="App">
      {/* Set up routes */}
      <Routes>
        {/* 루트 경로를 CommentScene으로 유지 (테스트용) */}
        <Route
          path="/"
          element={<CommentScene missionId={testMissionId} onMissionComplete={handleMissionComplete} />}
        />
        {/* ResultScene 라우트 추가 */}
        <Route path="/result" element={<ResultScene />} />
        {/* EndingScene 라우트 추가 */}
        <Route path="/ending" element={<EndingScene />} />
        {/* 기존 경로 유지 */}
        <Route path="/title" element={<TitleScreen />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  );
}

export default App;
