import React, { useState, useEffect, useCallback } from 'react';
// import { supabase } from '../services/supabase'; // 주석 처리
// import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // 주석 처리
import styles from './CommentScene.module.css';
import gameStyles from './Game.module.css'; // Game.module.css import 추가 (별칭 사용)

// 필요한 다른 컴포넌트 import (예시)
import MissionPanel from './MissionPanel'; // MissionPanel import 활성화
import OpinionStats from './OpinionStats'; // OpinionStats import 활성화
import CommentList from './CommentList';
import CommentInput from './CommentInput'; // CommentInput import 활성화
import MonologueBox from './MonologueBox'; // MonologueBox는 이미 사용 중이므로 주석 해제 유지
import ArticleContent from './ArticleContent'; // ArticleContent import 추가

// 필요한 Hook import (예시)
// import useGameState from '../hooks/useGameState';

// Comment 데이터 구조 정의
interface Comment {
  id: string;
  nickname?: string; // 닉네임 추가
  ip?: string; // IP 추가
  isReply?: boolean; // 대댓글 여부 추가
  content: string;
  likes: number;
  is_player: boolean;
  created_at: string; // 또는 Date 타입
}

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
  const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록 상태 추가
  const [attemptsLeft, setAttemptsLeft] = useState(10); // 임시 초기값
  const [monologue, setMonologue] = useState('');
  const [targetPositiveOpinion] = useState(70); // 임시 미션 목표 (긍정 70% 이상) - setTargetPositiveOpinion 제거
  const [isMissionOver, setIsMissionOver] = useState(false); // 미션 종료 상태 추가
  const [isCommentListVisible, setIsCommentListVisible] = useState(true); // 댓글 목록 표시 상태 추가
  const [sortOrder, setSortOrder] = useState('등록순'); // 정렬 상태 추가
  const [isMonologueVisible, setIsMonologueVisible] = useState(true); // 독백 표시 상태 추가

  // --- 핸들러 함수들 ---
  const toggleMonologueVisibility = () => {
    setIsMonologueVisible(!isMonologueVisible);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCommentList = () => {
    setIsCommentListVisible(!isCommentListVisible);
  };

  const refreshComments = () => {
    // TODO: 실제 댓글 새로고침 로직 구현 (placeholder 모드에서는 임시)
    console.log('Refreshing comments (placeholder)...');
    // 예: fetchInitialComments();
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
    // TODO: 실제 정렬 로직 구현
    console.log('Sort order changed:', event.target.value);
  };


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


  // --- 데이터 로딩 (임시 데이터 사용) ---
  useEffect(() => {
    console.log(`CommentScene: Initializing with placeholder data for mission ${missionId}`);

    // 임시 초기 댓글 설정 (닉네임, 랜덤 IP 추가)
    const generateRandomIp = () => `${Math.floor(Math.random() * 100 + 100)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`; // IP 범위 약간 조정
    const initialComments: Comment[] = [
      { id: 'temp-1', nickname: 'ㅇㅇ', ip: generateRandomIp(), content: '정병 있냐', likes: 0, is_player: false, created_at: new Date(Date.now() - 180000).toISOString() },
      { id: 'temp-2', nickname: '연갤러1', ip: generateRandomIp(), content: '네 다음 댓 법인세보다 못 벌었다며 슴 재무재표들고 헛소리치하던 조선족 습할배ㅋ', likes: 0, is_player: false, created_at: new Date(Date.now() - 120000).toISOString() },
      { id: 'temp-3', nickname: '연갤러1', ip: generateRandomIp(), content: '타조대가리 새끼 눈귀막고 처말하노ㅋ', likes: 0, is_player: false, created_at: new Date(Date.now() - 60000).toISOString(), isReply: true }, // isReply 추가, 'ㄴ' 제거
      { id: 'temp-4', nickname: '연갤러2', ip: generateRandomIp(), content: '우와 멋있다.. 혹시 상대가 초딩이어도 전력을 다하는 타입인가요?', likes: 0, is_player: false, created_at: new Date().toISOString() },
    ];
    setComments(initialComments);

    // 임시 초기 여론 및 시도 횟수 설정
    const initialOpinion = { positive: 60, negative: 25, neutral: 15 };
    const initialAttempts = 5;
    setOpinion(initialOpinion);
    setAttemptsLeft(initialAttempts);
    setMonologue('여기가 나의 전장이다... '); // 초기 독백 텍스트 변경

    // 초기 미션 상태 체크
    checkMissionStatus(initialOpinion.positive, initialAttempts);

    // Supabase 관련 로직 주석 처리
    /*
    // 초기 댓글 로드 함수
    const fetchInitialComments = async () => { ... };
    fetchInitialComments();

    // 초기 여론 및 시도 횟수 로드 함수
    const fetchInitialOpinionAndAttempts = async () => { ... };
    fetchInitialOpinionAndAttempts();

    // 실시간 구독 설정
    const opinionChannel = supabase.channel(...).subscribe();
    const commentChannel = supabase.channel(...).subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(opinionChannel);
      supabase.removeChannel(commentChannel);
      console.log(`CommentScene: Unsubscribed (Placeholder Mode)`);
    };
    */

    // 의존성 배열은 유지하되, Supabase 관련 로직이 없으므로 missionId와 checkMissionStatus만 남김
  }, [missionId, checkMissionStatus]);


  // --- 댓글 제출 핸들러 ---
  // nickname, password 파라미터 추가
  const handleCommentSubmit = async (commentText: string, nickname?: string, password?: string) => {
    if (isMissionOver || attemptsLeft <= 0) return;

    console.log('Submitting comment:', commentText, 'by', nickname || 'Default');
    // 시도 횟수 차감은 Edge Function 호출 성공 후 또는 Realtime 업데이트 시 처리하는 것이 더 정확함
    // 여기서는 일단 낙관적으로 UI만 업데이트 (선택 사항)
    // const newAttemptsLeft = attemptsLeft - 1;
    // setAttemptsLeft(newAttemptsLeft); // UI 즉시 반영 (선택적)

    // --- 임시 로컬 업데이트 로직 ---
    // 새 댓글 객체 생성 시 nickname과 ip 추가 (ip는 임시 생성)
    const generateRandomIp = () => `${Math.floor(Math.random() * 100 + 100)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    const newComment: Comment = {
      id: `player-${Date.now()}`,
      nickname: nickname, // 전달받은 nickname 사용
      ip: generateRandomIp(), // 임시 IP 생성
      content: commentText,
      likes: 0,
      is_player: true, // 플레이어가 작성한 댓글로 표시 (이 부분은 게임 로직에 따라 달라질 수 있음)
      created_at: new Date().toISOString(),
    };

    // 댓글 목록 상태 업데이트
    setComments((prevComments) => [...prevComments, newComment]);

    // 시도 횟수 차감
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    // 임시 여론 업데이트 (예시: 긍정 +5, 부정/중립 약간 감소)
    let newPositive = 0; // 아래에서 계산됨
    setOpinion((prevOpinion) => {
      newPositive = Math.min(100, prevOpinion.positive + 5); // 긍정 5 증가 (최대 100)
      const newNegative = Math.max(0, prevOpinion.negative - 2); // 부정 2 감소 (최소 0)
      // 중립은 100에서 긍정, 부정을 뺀 나머지
      const newNeutral = Math.max(0, 100 - newPositive - newNegative);
      return { positive: newPositive, negative: newNegative, neutral: newNeutral };
    });

    // 미션 상태 체크 (업데이트된 여론과 시도 횟수 사용)
    // setOpinion이 비동기일 수 있으므로, 계산된 newPositive 값을 직접 사용
    checkMissionStatus(newPositive, newAttemptsLeft);

    // Supabase 관련 로직 주석 처리
    /*
    // 댓글을 comments 테이블에 저장
    let insertedComment: Comment | null = null;
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from('comments')
        // ... (insert 로직)
        .select()
        .single();

      if (insertError) { ... }
      insertedComment = insertedData as Comment;
      // 낙관적 업데이트 (이미 위에서 처리함)
    } catch (error) { ... }

    // 'update-opinion' Edge Function 호출
    try {
      const { data, error } = await supabase.functions.invoke('update-opinion', { ... });
      if (error) throw error;
      console.log('Edge function response (Placeholder Mode - Not used):', data);
    } catch (error) {
      console.error('Error invoking update-opinion function (Placeholder Mode):', error);
      setMonologue('댓글 처리 중 오류 발생 (임시)');
    }
    */
  };

  return (
    // 전체 레이아웃 래퍼 -> gameContainer 스타일 적용
    <div className={gameStyles.gameContainer}>
      {/* MonologueBox를 gameContainer 바로 아래로 이동 */}
      {isMonologueVisible && monologue && (
        <MonologueBox text={monologue} />
      )}

      {/* 기존 commentSceneWrapper div에 gameArea 스타일 추가 */}
      <div className={`${gameStyles.gameArea} ${styles.commentSceneWrapper}`}>
        {/* 왼쪽 사이드 패널 (미션, 여론) - MonologueBox 제거 */}
        <div className={styles.leftSidePanel}>
          <MissionPanel missionId={missionId} />
          <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} />
          {/* 독백 토글 버튼은 여기에 유지 */}
          <button
            onClick={toggleMonologueVisibility}
            style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 10 }} // 임시 스타일
          >
            {isMonologueVisible ? '독백 숨기기' : '독백 보이기'}
          </button>
        </div>

        {/* 오른쪽 메인 콘텐츠 영역 */}
        <div className={styles.mainContentArea}>
          {/* 사이트 이름 헤더 */}
          <div className={styles.siteHeader}>acinside.com 갤러리</div>
          {/* 갤러리 제목 헤더 */}
          <h2 className={styles.header}>연예인 갤러리</h2>
          {/* 기사 제목 */}
          <div className={styles.articleTitle}>[일반] NJZ 어떻게 생각함?</div>
          {/* 작성자 정보 및 시간 */}
          <div className={styles.articleMeta}>
            <span>ㅇㅇ(118.235)</span> | <span>{new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}</span>
          </div>

          {/* 기사 내용 */}
          <ArticleContent />

          {/* 댓글 목록 섹션 */}
          <div className={styles.commentListSection}>
            {/* 댓글 목록 헤더 추가 */}
            <div className={styles.commentListHeader}>
              <div className={styles.commentCount}>
                전체 댓글 <span className={styles.countNumber}>{comments.length}</span>개
              </div>
              <div className={styles.headerControls}>
                <select className={styles.sortDropdown} value={sortOrder} onChange={handleSortChange}>
                  <option value="등록순">등록순</option>
                  <option value="최신순">최신순</option>
                  <option value="답글순">답글순</option> {/* 답글 기능은 미구현 */}
                </select>
                <span className={styles.listControls}>
                  <button onClick={scrollToTop} className={styles.controlButton}>본문 보기</button> |
                  <button onClick={toggleCommentList} className={styles.controlButton}>
                    댓글{isCommentListVisible ? '닫기 ▼' : '열기 ▲'} {/* 아이콘 방향 반대로 수정 */}
                  </button> |
                  <button onClick={refreshComments} className={styles.controlButton}>새로고침</button>
                </span>
              </div>
            </div>
            {/* CommentList에 isVisible prop 전달 */}
            <CommentList comments={comments} isVisible={isCommentListVisible} />
            {/* 댓글 목록 하단 컨트롤 추가 */}
            {isCommentListVisible && comments.length > 0 && ( // 댓글이 있고, 목록이 보일 때만 표시
              <div className={styles.commentListFooter}>
                <span className={styles.listControls}>
                  <button onClick={scrollToTop} className={styles.controlButton}>본문 보기</button> |
                  <button onClick={toggleCommentList} className={styles.controlButton}>
                    댓글{isCommentListVisible ? '닫기 ▼' : '열기 ▲'}
                  </button> |
                  <button onClick={refreshComments} className={styles.controlButton}>새로고침</button>
                </span>
              </div>
            )}
          </div>

          {/* 댓글 입력 섹션 */}
          <div className={styles.commentInputSection}>
            <CommentInput onSubmit={handleCommentSubmit} disabled={isMissionOver || attemptsLeft <= 0} />
          </div>
        </div> {/* mainContentArea 끝 */}
      </div> {/* commentSceneWrapper (이제 gameArea 역할도 함) 끝 */}
    </div> // gameContainer 끝
  );
};

export default CommentScene;
