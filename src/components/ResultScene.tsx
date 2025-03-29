import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Feedback {
  npc_name: string;
  message: string;
}

// ResultSceneProps 제거

const ResultScene: React.FC = () => { // Props 제거
  const location = useLocation(); // useLocation 훅 사용
  const navigate = useNavigate(); // useNavigate 훅 사용
  // state에서 missionId 가져오기 (타입 단언 및 기본값 설정)
  const missionId = (location.state as { missionId?: number })?.missionId;

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 피드백 로딩 상태
  const [isCheckingEnding, setIsCheckingEnding] = useState(false); // 엔딩 확인 로딩 상태 추가
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: 클라이언트 측에서 LLM API 직접 호출 로직 구현
        console.log('ResultScene: Fetching feedback (placeholder)...');
        // 임시 목업 데이터 설정
        await new Promise(resolve => setTimeout(resolve, 500)); // 가짜 로딩 시간
        const mockFeedback: Feedback = {
          npc_name: "임시 NPC",
          message: "임시 피드백 메시지입니다. LLM 연동이 필요합니다."
        };
        setFeedback(mockFeedback);

      } catch (err: any) {
        console.error('Error fetching feedback (placeholder):', err);
        setError(`피드백을 불러오는 중 오류 발생 (임시): ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };


    // missionId가 유효할 때만 fetchFeedback 호출
    if (missionId !== undefined) {
       fetchFeedback();
    } else {
       // missionId가 없으면 로딩 상태 해제 및 에러 설정
       setIsLoading(false);
       setError('미션 ID를 찾을 수 없습니다.');
       console.error('Mission ID not found in location state');
    }
  }, [missionId]); // missionId가 변경될 때마다 피드백 다시 로드

  // 다음으로 진행하는 함수 (async로 변경)
  const handleProceed = async () => {
    // TODO: 실제로는 현재 미션이 마지막인지 확인하는 로직 필요
    const isLastMission = true; // 임시로 마지막 미션이라고 가정

    if (isLastMission) {
      setIsCheckingEnding(true);
      setError(null);
      try {
        console.log('Checking final ending (placeholder)...');
        // TODO: 클라이언트 측 엔딩 확인 로직 구현
        // 게임 상태(episodeProgress 등)를 기반으로 엔딩 타입 결정
        await new Promise(resolve => setTimeout(resolve, 300)); // 가짜 로딩 시간
        const mockEndingType = "normal"; // 임시 엔딩 타입

        console.log('Ending type determined (placeholder):', mockEndingType);
        // 결과에 따라 EndingScene으로 이동
        navigate('/ending', { state: { endingType: mockEndingType } });

      } catch (err: any) {
        console.error('Error checking ending (placeholder):', err);
        setError(`최종 엔딩 확인 중 오류 발생 (임시): ${err.message}`);
        setIsCheckingEnding(false); // 에러 발생 시 로딩 상태 해제
      }
      // 성공 시 navigate 하므로 별도 로딩 해제 불필요
    } else {
      // 마지막 미션이 아니면 다음 에피소드로 이동
      console.log('Proceeding to next episode...');
      // TODO: 실제 다음 에피소드 ID 전달 로직 구현
      // navigate('/game', { state: { episodeId: nextEpisodeId } });
      navigate('/game'); // 임시로 게임 씬으로 이동
    }
  };

  return (
    <div className="result-scene">
      <h2>미션 결과</h2>
      {/* 피드백 로딩 또는 엔딩 확인 중 로딩 표시 */}
      {(isLoading || isCheckingEnding) && <p>처리 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* 로딩 및 에러 없을 때만 피드백과 버튼 표시 */}
      {feedback && !isLoading && !isCheckingEnding && !error && (
        <div className="feedback-box">
          <h3>{feedback.npc_name}</h3>
          <p>{feedback.message}</p>
          {/* 엔딩 확인 중에는 버튼 비활성화 */}
          <button onClick={handleProceed} disabled={isCheckingEnding}>다음으로</button>
        </div>
      )}
      {/* TODO: 미션 성공/실패 여부 표시 */}
    </div>
  );
};

export default ResultScene;
