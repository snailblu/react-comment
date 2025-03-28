import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; // Supabase 클라이언트 import, 확장자 제거
import { useLocation, useNavigate } from 'react-router-dom'; // useLocation, useNavigate 추가

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
        // 'generate-feedback' 함수 호출
        const { data, error: functionError } = await supabase.functions.invoke('generate-feedback', {
          // 필요하다면 missionId 또는 다른 데이터를 body로 전달
          // body: { missionId },
        });

        if (functionError) {
          throw functionError;
        }

        if (data) {
          setFeedback(data as Feedback);
        } else {
          throw new Error('No feedback data received');
        }
      } catch (err: any) {
        console.error('Error fetching feedback:', err);
        setError(`피드백을 불러오는 중 오류 발생: ${err.message}`);
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
        console.log('Checking final ending...');
        // 'check-ending' 함수 호출
        const { data: endingResult, error: functionError } = await supabase.functions.invoke('check-ending', {
          // 필요하다면 플레이어 상태나 ID 전달
          // body: { playerId: '...' }
        });

        if (functionError) {
          throw functionError;
        }

        if (endingResult && endingResult.endingType) {
          console.log('Ending type received:', endingResult.endingType);
          // 결과에 따라 EndingScene으로 이동
          navigate('/ending', { state: { endingType: endingResult.endingType } });
        } else {
          throw new Error('Invalid ending data received');
        }
      } catch (err: any) {
        console.error('Error checking ending:', err);
        setError(`최종 엔딩 확인 중 오류 발생: ${err.message}`);
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
