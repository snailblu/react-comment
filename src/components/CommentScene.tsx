import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CommentScene.module.css';
import gameStyles from './StoryScene.module.css';
import { Mission } from '../types'; // Mission 타입 import 추가

// 필요한 다른 컴포넌트 import (예시)
import MissionPanel from './MissionPanel'; // MissionPanel import 활성화
import OpinionStats from './OpinionStats'; // OpinionStats import 활성화
import CommentList from './CommentList';
import CommentInput from './CommentInput'; // CommentInput import 활성화
import MonologueBox from './MonologueBox'; // MonologueBox는 이미 사용 중이므로 주석 해제 유지
import ArticleContent from './ArticleContent'; // ArticleContent import 추가

// 필요한 Hook import (예시)
// import useGameState from '../hooks/useGameState';

// Comment 데이터 구조 정의 (동일하게 유지) - types/index.ts 로 이동 고려
interface Comment {
  id: string;
  nickname?: string;
  ip?: string;
  isReply?: boolean;
  content: string;
  likes: number;
  is_player: boolean;
  created_at: string; // 또는 Date 타입
}

// Opinion 데이터 구조 정의 - types/index.ts 로 이동 고려
interface Opinion {
  positive: number;
  negative: number;
  neutral: number;
}

interface CommentSceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const CommentScene: React.FC<CommentSceneProps> = ({ onMissionComplete }) => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [missionData, setMissionData] = useState<Mission | null>(null); // 미션 데이터 상태 추가
  const [opinion, setOpinion] = useState<Opinion>({ positive: 0, negative: 0, neutral: 0 }); // 초기값 0으로 설정
  const [comments, setComments] = useState<Comment[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(0); // 초기값 0으로 설정
  const [monologue, setMonologue] = useState('');
  const [isMissionOver, setIsMissionOver] = useState(false);
  const [isCommentListVisible, setIsCommentListVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState('등록순');
  const [isMonologueVisible, setIsMonologueVisible] = useState(true);
  const mainContentAreaRef = useRef<HTMLDivElement>(null);

  // --- 핸들러 함수들 ---
  const toggleMonologueVisibility = () => {
    setIsMonologueVisible(!isMonologueVisible);
  };

  const scrollToTop = () => {
    // gameAreaRef 대신 mainContentAreaRef를 사용하여 스크롤
    mainContentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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


  // --- 미션 상태 체크 로직 ---
  const checkMissionStatus = useCallback((currentPositive: number, currentAttempts: number) => {
    if (isMissionOver || !missionData) return; // missionData 없으면 체크 중단

    if (currentPositive >= (missionData.goal?.positive ?? 100)) { // 목표값은 missionData에서 가져옴 (기본값 100)
      console.log('Mission Success!');
      setMonologue('미션 성공! 목표를 달성했다.'); // 성공 독백은 고정 또는 missionData에서 가져오도록 수정 가능
      setIsMissionOver(true);
      if (onMissionComplete) {
        onMissionComplete(true);
      } else {
        navigate('/result', { state: { missionId: missionId } });
      }
    } else if (currentAttempts <= 0) {
      console.log('Mission Failed!');
      setMonologue('실패했다... 시도 횟수를 다 써버렸어.'); // 실패 독백은 고정 또는 missionData에서 가져오도록 수정 가능
      setIsMissionOver(true);
      if (onMissionComplete) {
        onMissionComplete(false);
      } else {
         navigate('/ending', { state: { endingType: 'bad_ending' } });
      }
    }
  }, [isMissionOver, missionData, onMissionComplete, navigate, missionId]); // 의존성 배열에 missionData 추가


  // --- 데이터 로딩 (missions.json 사용) ---
  useEffect(() => {
    if (!missionId) {
      console.error("CommentScene: missionId is missing from URL parameters.");
      setMonologue("오류: 미션 정보를 찾을 수 없습니다.");
      setIsMissionOver(true);
      return;
    }

    const fetchMissionData = async () => {
      try {
        const response = await fetch('/missions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allMissions: Record<string, Mission> = await response.json();
        const currentMission = allMissions[missionId];

        if (!currentMission) {
          console.error(`CommentScene: Mission data not found for missionId: ${missionId}`);
          setMonologue("오류: 해당 미션 데이터를 찾을 수 없습니다.");
          setIsMissionOver(true);
          return;
        }

        console.log(`CommentScene: Initializing with data for mission ${missionId}`, currentMission);
        setMissionData(currentMission);

        // 초기 상태 설정
        setOpinion(currentMission.initialOpinion ?? { positive: 50, negative: 30, neutral: 20 }); // 기본값 설정
        setAttemptsLeft(currentMission.max_attempts ?? 5); // 기본값 설정
        setMonologue(currentMission.initialMonologue ?? '댓글을 달아 여론을 조작하자...'); // 기본값 설정

        // 초기 댓글 설정 (created_at 직접 사용)
        // const now = Date.now(); // 더 이상 필요 없음

        // initialComments 로드 시 타입 문제 해결 및 필수 필드 확인
        const loadedComments: Comment[] = (currentMission.initialComments ?? [])
          .filter(c => c.id && c.content && c.created_at) // id, content, created_at 필수 확인
          .map((c): Comment => ({ // 반환 타입을 명시적으로 Comment로 지정
            id: c.id!,
            nickname: c.nickname,
            ip: c.ip,
            isReply: c.isReply,
            content: c.content!,
            likes: c.likes ?? 0,
            is_player: c.is_player ?? false,
            created_at: c.created_at!, // missions.json의 created_at 값을 직접 사용
            // delay는 Comment 타입에 없으므로 포함하지 않음
          }));
        setComments(loadedComments);

        // 초기 미션 상태 체크
        checkMissionStatus(
          currentMission.initialOpinion?.positive ?? 50,
          currentMission.max_attempts ?? 5
        );

      } catch (error) {
        console.error("Failed to fetch mission data:", error);
        setMonologue("오류: 미션 데이터를 불러오는 데 실패했습니다.");
        setIsMissionOver(true);
      }
    };

    fetchMissionData();

  }, [missionId, checkMissionStatus]); // 의존성 배열 유지


  // --- 댓글 제출 핸들러 ---
  const handleCommentSubmit = async (commentText: string, nickname?: string, password?: string) => {
    if (isMissionOver || attemptsLeft <= 0 || !missionData) return; // missionData 체크 추가

    console.log('Submitting comment:', commentText, 'by', nickname || 'Default');

    // --- 임시 로컬 업데이트 로직 ---
    // 플레이어 댓글 IP는 고정값 또는 다른 규칙으로 설정 (예: '127.0.0.1')
    const playerIp = '127.0.0.1'; // 예시 고정 IP
    const newComment: Comment = {
      id: `player-${Date.now()}`,
      nickname: nickname,
      ip: playerIp, // 고정된 플레이어 IP 사용
      content: commentText,
      likes: 0,
      is_player: true,
      created_at: new Date().toISOString(),
    };

    setComments((prevComments) => [...prevComments, newComment]);

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    // 임시 여론 업데이트 (더 정교한 로직 필요 시 수정)
    let newPositive = 0;
    setOpinion((prevOpinion) => {
      newPositive = Math.min(100, prevOpinion.positive + 5);
      const newNegative = Math.max(0, prevOpinion.negative - 2);
      const newNeutral = Math.max(0, 100 - newPositive - newNegative);
      return { positive: newPositive, negative: newNegative, neutral: newNeutral };
    });

    checkMissionStatus(newPositive, newAttemptsLeft);
  };

  // --- 로딩 상태 표시 ---
  if (!missionData) {
    return <div className={gameStyles.storySceneContainer}>Loading mission...</div>; // 간단한 로딩 표시
  }

  return (
    <div className={gameStyles.storySceneContainer}>
      {isMonologueVisible && monologue && (
        <MonologueBox text={monologue} />
      )}

      <div className={`${gameStyles.storyArea} ${styles.commentSceneWrapper}`}>
        <div className={styles.leftSidePanel}>
          <MissionPanel missionId={missionId || null} />
          <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} />
          <button
            onClick={toggleMonologueVisibility}
            style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 10 }}
          >
            {isMonologueVisible ? '독백 숨기기' : '독백 보이기'}
          </button>
        </div>

        <div ref={mainContentAreaRef} className={styles.mainContentArea}>
          <div className={styles.siteHeader}>acinside.com 갤러리</div>
          <h2 className={styles.header}>연예인 갤러리</h2>
          {/* 기사 제목 (missionData에서 가져옴) */}
          <div className={styles.articleTitle}>{missionData.articleTitle ?? '기사 제목 없음'}</div>
          {/* 작성자 정보 및 시간 (missionData의 articleCreatedAt 사용) */}
          <div className={styles.articleMeta}>
            <span>ㅇㅇ(118.235)</span> | <span>{missionData.articleCreatedAt ? new Date(missionData.articleCreatedAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '시간 정보 없음'}</span>
          </div>

          {/* 기사 내용 (missionData에서 가져옴) */}
          <ArticleContent
            content={missionData.articleContent} // content prop은 이미 존재
            imageFilename={missionData.articleImage} // imageFilename prop 추가 필요
            // attachmentFilename prop 전달 제거
          />

          <div className={styles.commentListSection}>
            <div className={styles.commentListHeader}>
              <div className={styles.commentCount}>
                전체 댓글 <span className={styles.countNumber}>{comments.length}</span>개
              </div>
              <div className={styles.headerControls}>
                <select className={styles.sortDropdown} value={sortOrder} onChange={handleSortChange}>
                  <option value="등록순">등록순</option>
                  <option value="최신순">최신순</option>
                  <option value="답글순">답글순</option>
                </select>
                <span className={styles.listControls}>
                  <button onClick={scrollToTop} className={styles.controlButton}>본문 보기</button> |
                  <button onClick={toggleCommentList} className={styles.controlButton}>
                    댓글{isCommentListVisible ? '닫기 ▼' : '열기 ▲'}
                  </button> |
                  <button onClick={refreshComments} className={styles.controlButton}>새로고침</button>
                </span>
              </div>
            </div>
            <CommentList comments={comments} isVisible={isCommentListVisible} />
            {isCommentListVisible && comments.length > 0 && (
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

          <div className={styles.commentInputSection}>
            <CommentInput onSubmit={handleCommentSubmit} disabled={isMissionOver || attemptsLeft <= 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentScene;
