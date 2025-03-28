import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; // supabase 클라이언트 import 추가
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
  // 예: 현재 여론 상태, 댓글 목록, 남은 시도 횟수, 독백 내용 등
  const [opinion, setOpinion] = useState({ positive: 50, negative: 30, neutral: 20 }); // 임시 초기값
  const [comments, setComments] = useState<any[]>([]); // 댓글 목록 타입 정의 필요
  const [attemptsLeft, setAttemptsLeft] = useState(10); // 임시 초기값
  const [monologue, setMonologue] = useState('');

  // --- 데이터 로딩 및 실시간 구독 ---
  useEffect(() => {
    console.log(`CommentScene: Loading data for mission ${missionId}`);

    // TODO: missionId로 미션 정보(MissionPanel), 초기 여론(OpinionStats), 댓글(CommentList) 로드
    // TODO: opinions 테이블 실시간 구독 설정
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
             // 이제 TypeScript는 payload.new에 해당 속성들이 있다고 확신합니다.
             // 타입 단언을 사용하여 명확하게 타입을 지정할 수도 있습니다.
             const newOpinion = payload.new as OpinionPayload;
             setOpinion({ positive: newOpinion.positive, negative: newOpinion.negative, neutral: newOpinion.neutral });
          }
        }
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
      console.log(`CommentScene: Unsubscribed from opinion updates for mission ${missionId}`);
    };
  }, [missionId]); // missionId가 변경되면 재실행

  // --- 댓글 제출 핸들러 ---
  const handleCommentSubmit = async (commentText: string) => {
    console.log('Submitting comment:', commentText);
    // TODO: 남은 시도 횟수 차감 (setAttemptsLeft)
    // TODO: 댓글을 comments 테이블에 저장 (is_player: true)
    // TODO: 'update-opinion' Edge Function 호출
    try {
      const { data, error } = await supabase.functions.invoke('update-opinion', {
        body: { mission_id: missionId, comment: commentText },
      });

      if (error) throw error;

      console.log('Edge function response:', data);
      // 함수 응답(업데이트된 여론)을 바로 반영할 수도 있지만, Realtime 구독에 의존하는 것이 일반적
      // TODO: 결과에 따른 독백 설정 (setMonologue)
      // TODO: 미션 성공/실패 조건 확인 및 onMissionComplete 호출
    } catch (error) {
      console.error('Error invoking update-opinion function:', error);
      // TODO: 에러 처리 (예: 사용자에게 알림)
    }
  };

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

      {/* 임시 완료 버튼 */}
      <button onClick={() => onMissionComplete(true)}>임시 성공</button>
      <button onClick={() => onMissionComplete(false)}>임시 실패</button>
    </div>
  );
};

export default CommentScene;
