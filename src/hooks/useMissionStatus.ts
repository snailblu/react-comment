import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mission, Opinion, Comment } from '../types'; // 필요한 타입 import

interface UseMissionStatusResult {
  attemptsLeft: number;
  isMissionOver: boolean;
  missionResultMonologue: string; // 미션 결과 관련 독백
  decrementAttempts: () => number; // 시도 횟수 감소 후 남은 횟수 반환
  checkMissionStatus: (currentOpinion: Opinion, commentsRef: React.RefObject<Comment[]>, currentAttempts: number) => void; // currentAttempts 파라미터 추가 및 댓글 ref 유지
  resetMissionStatus: (initialAttempts: number) => void; // 상태 초기화 함수 추가
}

const useMissionStatus = (
  missionData: Mission | null,
  initialAttempts: number,
  missionId: string | undefined,
  onMissionComplete?: (success: boolean) => void
): UseMissionStatusResult => {
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttempts);
  const [isMissionOver, setIsMissionOver] = useState(false);
  const [missionResultMonologue, setMissionResultMonologue] = useState(''); // 결과 독백 상태
  const navigate = useNavigate();

  // 초기 시도 횟수가 변경될 때 상태 업데이트 (useMissionData 로딩 완료 후)
  useEffect(() => {
    setAttemptsLeft(initialAttempts);
    setIsMissionOver(false); // 미션 ID 변경 시 초기화
    setMissionResultMonologue(''); // 미션 ID 변경 시 초기화
  }, [initialAttempts, missionId]); // missionId도 의존성에 추가

  // 시도 횟수 감소 함수
  const decrementAttempts = useCallback((): number => {
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);
    return newAttemptsLeft; // 감소 후 남은 횟수 반환
  }, [attemptsLeft]);

  // 미션 상태 체크 함수 수정
  const checkMissionStatus = useCallback((currentOpinion: Opinion, commentsRef: React.RefObject<Comment[]>, currentAttempts: number) => { // currentAttempts 파라미터 추가
    // isMissionOver 또는 missionData가 없을 때만 체크
    if (isMissionOver || !missionData) {
      return;
    }

    // 전달받은 currentAttempts가 0 이하일 때만 체크 진행
    if (currentAttempts <= 0) {
        console.log("Checking mission status as attempts reached 0 or less.");
        setMissionResultMonologue('결과가 나왔나...?'); // 결과 확인 독백 설정
        setIsMissionOver(true); // 미션 종료 상태로 설정

        const positiveGoal = missionData.goal?.positive ?? 100; // 목표 긍정 여론
    const isSuccess = currentOpinion.positive >= positiveGoal;

    console.log(`Mission ${isSuccess ? 'Success' : 'Failed'}! Positive: ${currentOpinion.positive}% ${isSuccess ? '>=' : '<'} Goal: ${positiveGoal}%`);

    // 2초 후 결과 처리
    setTimeout(() => {
      if (onMissionComplete) {
        onMissionComplete(isSuccess);
      } else {
        // ResultScene으로 이동, 상태 전달 시 commentsRef 사용
        navigate('/result', {
          state: {
            missionId: missionId,
            success: isSuccess,
            allComments: commentsRef.current, // 최신 댓글 목록 전달
            missionTitle: missionData?.title
          }
        });
      }
    }, 2000); // 2초 지연
    } else {
        // 이 경우는 CommentScene에서 호출되지 않아야 하지만, 방어적으로 로그 추가
        console.log(`checkMissionStatus called but currentAttempts (${currentAttempts}) is greater than 0.`);
    }

  }, [isMissionOver, missionData, navigate, missionId, onMissionComplete]); // attemptsLeft 의존성 제거, commentsRef는 의존성 배열에서 제외 (ref는 변경되지 않음)

  // 상태 초기화 함수 (예: 새 미션 시작 시)
  const resetMissionStatus = useCallback((newInitialAttempts: number) => {
      setAttemptsLeft(newInitialAttempts);
      setIsMissionOver(false);
      setMissionResultMonologue('');
  }, []);


  return {
    attemptsLeft,
    isMissionOver,
    missionResultMonologue,
    decrementAttempts,
    checkMissionStatus,
    resetMissionStatus, // 초기화 함수 노출
  };
};

export default useMissionStatus;
