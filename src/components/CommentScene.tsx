import React, { useState, useEffect, useCallback } from 'react'; // useCallback 추가
import { supabase } from '../services/supabase'; // supabase 클라이언트 import 추가, 확장자 제거
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Realtime 타입 import 추가
// import styles from './CommentScene.module.css'; // 추후 CSS 모듈 생성 시 활성화

// 필요한 다른 컴포넌트 import (예시)
// import MissionPanel from './MissionPanel';
// import OpinionStats from './OpinionStats';
// import CommentList from './CommentList';
// import CommentInput from './CommentInput';
// import MonologueBox from './MonologueBox';

// 필요한 Hook import (예시)
// import useGameState from '../hooks/useGameState';
// import { supabase } from '../services/supabase';

// opinions 테이블 데이터 구조 인터페이스 정의
interface OpinionPayload {
  positive: number;
  negative: number;
  neutral: number;
  // 필요하다면 다른 필드도 추가 (예: id, mission_id, updated_at)
}

interface CommentSceneProps {
  missionId: string; // 현재 진행 중인 미션 ID를 props로 받음 (예시)
  onMissionComplete: (success: boolean) => void; // 미션 완료 시 호출될 콜백 함수
}

const CommentScene: React.FC<CommentSceneProps> = ({ missionId, onMissionComplete }) => {
  // --- 상태 관리 ---
  // 예: 현재 여론 상태, 남은 시도 횟수, 독백 내용 등
  const [opinion, setOpinion] = useState({ positive: 50, negative: 30, neutral: 20 }); // 임시 초기값
  // const [comments, setComments] = useState<any[]>([]); // 댓글 목록 - 현재 미사용, 주석 처리 또는 제거
  const [attemptsLeft, setAttemptsLeft] = useState(10); // 임시 초기값
  const [monologue, setMonologue] = useState('');
  const [targetPositiveOpinion] = useState(70); // 임시 미션 목표 (긍정 70% 이상) - setTargetPositiveOpinion 제거
  const [isMissionOver, setIsMissionOver] = useState(false); // 미션 종료 상태 추가

  // --- 미션 상태 체크 로직 (useCallback으로 감싸기) ---
  const checkMissionStatus = useCallback((currentPositive: number, currentAttempts: number) => {
    if (isMissionOver) return; // 이미 종료되었으면 중복 호출 방지

    if (currentPositive >= targetPositiveOpinion) {
      console.log('Mission Success!');
      setMonologue('미션 성공! 목표를 달성했다.'); // 성공 독백
      setIsMissionOver(true);
      onMissionComplete(true); // 성공 콜백 호출
    } else if (currentAttempts <= 0) {
      console.log('Mission Failed!');
      setMonologue('실패했다... 시도 횟수를 다 써버렸어.'); // 실패 독백
      setIsMissionOver(true);
      onMissionComplete(false); // 실패 콜백 호출
    }
  }, [isMissionOver, targetPositiveOpinion, onMissionComplete]); // 의존성 배열 추가


  // --- 데이터 로딩 및 실시간 구독 ---
  useEffect(() => {
    console.log(`CommentScene: Loading data for mission ${missionId}`);

    // TODO: missionId로 미션 정보(MissionPanel), 초기 여론(OpinionStats), 댓글(CommentList), 목표(targetPositiveOpinion) 로드

    // opinions 테이블 실시간 구독 설정
    const channel = supabase
      .channel(`opinion-updates-${missionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'opinions',
          filter: `mission_id=eq.${missionId}`, // 해당 미션 ID의 변경만 수신
        },
        // payload 타입에 OpinionPayload 적용
        (payload: RealtimePostgresChangesPayload<OpinionPayload>) => {
          console.log('Realtime opinion update received:', payload.new);
          // payload.new가 null/undefined가 아니고, 필요한 속성들을 가지고 있는지 명시적으로 확인
          if (payload.new && 'positive' in payload.new && 'negative' in payload.new && 'neutral' in payload.new) {
              const newOpinion = payload.new as OpinionPayload;
              setOpinion(() => { // prevOpinion 사용하지 않으므로 제거
                // 상태 업데이트 후 미션 성공/실패 체크 로직 호출
                // useEffect 내부에서 attemptsLeft 최신 값을 참조하도록 수정
                checkMissionStatus(newOpinion.positive, attemptsLeft);
                return { positive: newOpinion.positive, negative: newOpinion.negative, neutral: newOpinion.neutral };
              });
           }
         }
       )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
      console.log(`CommentScene: Unsubscribed from opinion updates for mission ${missionId}`);
    };
    // useEffect 의존성 배열에 attemptsLeft와 checkMissionStatus 추가
  }, [missionId, attemptsLeft, checkMissionStatus]);


  // --- 댓글 제출 핸들러 (현재 미사용, 주석 처리) ---
  /*
  const handleCommentSubmit = async (commentText: string) => {
    if (isMissionOver || attemptsLeft <= 0) return; // 미션 종료 또는 시도 횟수 없으면 제출 불가

    console.log('Submitting comment:', commentText);
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft); // 시도 횟수 차감

    // TODO: 댓글을 comments 테이블에 저장 (is_player: true)

    // 'update-opinion' Edge Function 호출
    try {
      const { data, error } = await supabase.functions.invoke('update-opinion', {
        body: { mission_id: missionId, comment: commentText },
      });

      if (error) throw error;

      console.log('Edge function response:', data);
      // Realtime 구독이 opinion 상태를 업데이트하고, 그 업데이트 콜백에서 checkMissionStatus가 호출됨
      // 만약 Realtime 지연이 우려되거나 즉시 실패 판정(시도 횟수 0)이 필요하면 여기서도 checkMissionStatus 호출 가능
      // checkMissionStatus(opinion.positive, newAttemptsLeft); // 여기서 즉시 실패 판정 가능

      // TODO: 결과에 따른 독백 설정 (checkMissionStatus에서 처리)
    } catch (error) {
      console.error('Error invoking update-opinion function:', error);
      setMonologue('댓글 처리 중 오류가 발생했습니다.'); // 에러 독백
      // TODO: 사용자에게 에러 알림
    }
  };
  */

  return (
    <div /* className={styles.commentSceneContainer} */ >
      <h2>댓글 알바 씬 (Mission ID: {missionId})</h2>
      {/* TODO: 각 하위 컴포넌트 렌더링 */}
      {/* <MissionPanel missionId={missionId} /> */}
      {/* <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} /> */}
      {/* <CommentList comments={comments} /> */}
      {/* <CommentInput onSubmit={handleCommentSubmit} disabled={attemptsLeft <= 0} /> */}
      {/* {monologue && <MonologueBox text={monologue} />} */}

      <p>여론: 긍정 {opinion.positive}% / 부정 {opinion.negative}% / 중립 {opinion.neutral}%</p>
      <p>남은 시도: {attemptsLeft}</p>
      <p>댓글 목록: (구현 예정)</p>
      <p>댓글 입력: (구현 예정)</p>
      {monologue && <p>독백: {monologue}</p>}

      {/* 미션 종료 시 버튼 비활성화 또는 다른 UI 표시 가능 */}
      {/* <CommentInput onSubmit={handleCommentSubmit} disabled={isMissionOver || attemptsLeft <= 0} /> */}
    </div>
  );
};

export default CommentScene;
