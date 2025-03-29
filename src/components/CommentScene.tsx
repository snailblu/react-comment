import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CommentScene.module.css';
import gameStyles from './StoryScene.module.css';

// 필요한 타입 import
import { Mission, Comment, Opinion, ArticleReactions as ArticleReactionsType } from '../types';

// 필요한 컴포넌트 import
import MissionPanel from './MissionPanel';
import OpinionStats from './OpinionStats';
import CommentList from './CommentList';
import CommentInput from './CommentInput';
import MonologueBox from './MonologueBox';
import ArticleContent from './ArticleContent';
import ArticleReactions from './ArticleReactions';
import { Button } from './ui/button'; // 필요하다면 유지

// Custom Hooks import
import useMissionData from '../hooks/useMissionData';
import useArticleState from '../hooks/useArticleState';
import useCommentState from '../hooks/useCommentState';
import useGeminiComments from '../hooks/useGeminiComments';
import useMissionStatus from '../hooks/useMissionStatus';

interface CommentSceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const CommentScene: React.FC<CommentSceneProps> = ({ onMissionComplete }) => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate(); // useMissionStatus 내부에서 사용되므로 유지

  // --- Custom Hooks 사용 ---
  const {
    missionData,
    initialComments,
    initialOpinion,
    initialLikes,
    initialDislikes,
    initialMonologue,
    totalAttempts,
    isLoading: isMissionLoading, // 이름 충돌 방지
    error: missionError,
  } = useMissionData(missionId);

  const {
    articleLikes,
    articleDislikes,
    opinion,
    handleLikeArticle,
    handleDislikeArticle,
    setPredictedReactions,
  } = useArticleState(initialLikes, initialDislikes, initialOpinion);

  const {
    comments,
    setComments, // AI 댓글 업데이트를 위해 필요
    addComment,
    addReply,
    sortOrder,
    handleSortChange, // useCommentState에서 가져옴
    commentsRef, // 미션 결과 전달을 위해 필요
  } = useCommentState(initialComments);

  const {
    isGeneratingComments,
    aiMonologue,
    triggerGenerateComments,
  } = useGeminiComments();

  const {
    attemptsLeft,
    isMissionOver,
    missionResultMonologue,
    decrementAttempts,
    checkMissionStatus,
    // resetMissionStatus, // 필요시 사용
  } = useMissionStatus(missionData, totalAttempts, missionId, onMissionComplete);

  // --- UI 상태 ---
  const [currentMonologue, setCurrentMonologue] = useState(''); // 통합된 독백 상태
  const [isCommentListVisible, setIsCommentListVisible] = useState(true);
  const [isMonologueVisible, setIsMonologueVisible] = useState(true);
  const mainContentAreaRef = useRef<HTMLDivElement>(null);

  // --- 독백 상태 관리 ---
  useEffect(() => {
    // 로딩/오류 > 미션 결과 > AI 상태 > 초기 순으로 우선순위 설정
    if (isMissionLoading) {
      setCurrentMonologue('미션 데이터를 불러오는 중...');
    } else if (missionError) {
      setCurrentMonologue(`오류: ${missionError}`);
    } else if (missionResultMonologue) {
      setCurrentMonologue(missionResultMonologue);
    } else if (aiMonologue) {
      setCurrentMonologue(aiMonologue);
    } else {
      setCurrentMonologue(initialMonologue);
    }
  }, [isMissionLoading, missionError, missionResultMonologue, aiMonologue, initialMonologue]);


  // --- UI 관련 핸들러 ---
  const toggleMonologueVisibility = () => {
    setIsMonologueVisible(!isMonologueVisible);
  };

  const scrollToTop = () => {
    mainContentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCommentList = () => {
    setIsCommentListVisible(!isCommentListVisible);
  };

  const refreshComments = () => {
    // TODO: 실제 댓글 새로고침 로직 구현
    console.log('Refreshing comments (placeholder)...');
  };

  // handleSortChange는 useCommentState 훅에서 제공 (컴포넌트 내 정의 제거됨)
  // 기사 좋아요/싫어요 핸들러는 useArticleState 훅에서 제공 (컴포넌트 내 정의 제거됨)


  // --- 댓글/대댓글 제출 및 AI 연동 핸들러 ---
  const handleSubmitAndGenerateAi = async (newlyAddedComment: Comment | null) => {
    // missionData null 체크 강화
    if (!newlyAddedComment || !missionData) {
        console.error("handleSubmitAndGenerateAi: No newly added comment or mission data.");
        return;
    }

    const currentAttempts = decrementAttempts(); // 시도 횟수 감소

    // AI 댓글 생성 요청 (현재 댓글 목록과 반응 사용)
    const currentReactions: ArticleReactionsType = { likes: articleLikes, dislikes: articleDislikes };
    // commentsRef.current가 null일 수 있으므로 빈 배열로 대체
    const commentsForAi = commentsRef.current ?? [];
    const aiResult = await triggerGenerateComments(missionData, commentsForAi, currentReactions);

    // AI 응답 처리
    if (!aiResult.error) {
      // 1. AI가 생성한 댓글 추가 (기존 댓글 목록과 병합)
      if (aiResult.generatedComments.length > 0) {
        setComments(prevComments => {
          let baseComments = [...prevComments]; // 현재 상태 복사
          let newCommentsList = [...baseComments];
          const tempGeneratedComments: Comment[] = [];

          aiResult.generatedComments.forEach(newComment => {
            if (newComment.isReply && newComment.parentId) {
              const targetIdentifier = newComment.parentId;
              let actualParentId: string | undefined = undefined;
              let parentComment: Comment | undefined = undefined;

              parentComment = [...newCommentsList, ...tempGeneratedComments].find(c => c.id === targetIdentifier);
              if (!parentComment) {
                parentComment = [...newCommentsList, ...tempGeneratedComments].find(c => c.nickname === targetIdentifier);
              }

              if (parentComment) {
                actualParentId = parentComment.id;
                newComment.parentId = actualParentId;
                const parentIndex = newCommentsList.findIndex(comment => comment.id === actualParentId);
                if (parentIndex !== -1) {
                  let insertionIndex = parentIndex + 1;
                  while (insertionIndex < newCommentsList.length && newCommentsList[insertionIndex].isReply && newCommentsList[insertionIndex].parentId === actualParentId) {
                    insertionIndex++;
                  }
                  newCommentsList.splice(insertionIndex, 0, newComment);
                } else {
                  tempGeneratedComments.push(newComment);
                }
              } else {
                console.warn(`Parent comment target "${targetIdentifier}" provided by AI does not match any existing ID or Nickname. Appending reply as a regular comment.`);
                newComment.parentId = undefined;
                tempGeneratedComments.push(newComment);
              }
            } else {
              tempGeneratedComments.push(newComment);
            }
          });
          newCommentsList.push(...tempGeneratedComments.filter(tc => !newCommentsList.some(nc => nc.id === tc.id)));
          return newCommentsList;
        });
      }

      // 2. AI가 예측한 추천/비추천 수 반영
      if (aiResult.predictedReactions) {
        setPredictedReactions(aiResult.predictedReactions.likes, aiResult.predictedReactions.dislikes);
      }
    }

    // 시도 횟수가 0 이하이면 미션 상태 체크 (최신 opinion, commentsRef, currentAttempts 전달)
    if (currentAttempts <= 0) {
      console.log("Attempts depleted after submission and AI generation. Checking mission status.");
      checkMissionStatus(opinion, commentsRef, currentAttempts); // currentAttempts 전달 추가
    }
  };

  // 댓글 제출 핸들러
  const handleCommentSubmit = async (commentText: string, nickname?: string, password?: string) => {
    if (isMissionOver || attemptsLeft <= 0 || !missionData) return;
    const addedComment = addComment(commentText, nickname); // useCommentState 훅 사용
    await handleSubmitAndGenerateAi(addedComment); // 공통 로직 호출
  };

  // 대댓글 제출 핸들러
  const handleReplySubmit = async (replyContent: string, parentId: string, nickname?: string, password?: string) => {
    if (isMissionOver || attemptsLeft <= 0 || !missionData) return;
    const addedReply = addReply(replyContent, parentId, nickname); // useCommentState 훅 사용
    await handleSubmitAndGenerateAi(addedReply); // 공통 로직 호출
  };


  // --- 로딩 및 오류 상태 표시 ---
  if (isMissionLoading) {
    return <div className={gameStyles.storySceneContainer}>미션 데이터를 불러오는 중...</div>;
  }
  if (missionError) {
    return <div className={gameStyles.storySceneContainer}>오류: {missionError}</div>;
  }
  // missionData가 null인 경우 (로딩 후에도) 명시적으로 처리
  if (!missionData) {
    return <div className={gameStyles.storySceneContainer}>미션 데이터를 찾을 수 없습니다.</div>;
  }


  return (
    <div className={gameStyles.storySceneContainer}>
      {/* MonologueBox에 currentMonologue 전달 */}
      {isMonologueVisible && currentMonologue && (
        <MonologueBox text={currentMonologue} />
      )}

      {/* 댓글 생성 중 인터랙션 방지 */}
      <div
        className={`${gameStyles.storyArea} ${styles.commentSceneWrapper}`}
        style={{ pointerEvents: isGeneratingComments ? 'none' : 'auto' }}
      >
        {/* 왼쪽 패널은 항상 인터랙션 가능하도록 */}
        <div className={styles.leftSidePanel} style={{ pointerEvents: 'auto' }}>
          {/* MissionPanel에 attemptsLeft와 totalAttempts 전달 */}
          <MissionPanel
            missionId={missionId || null}
            attemptsLeft={attemptsLeft}
            totalAttempts={totalAttempts} // useMissionData에서 가져온 값 사용
          />
          {/* OpinionStats에 opinion과 attemptsLeft 전달 */}
          <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} />

          {/* --- 디버그 버튼 (필요시 유지) --- */}
          {/*
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              // 디버그 버튼 클릭 시 commentsRef 사용
              onClick={() => navigate('/result', { state: { missionId: missionId, success: true, allComments: commentsRef.current, missionTitle: missionData?.title } })}
              disabled={isMissionOver}
            >
              (디버그) 성공 씬 이동
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/result', { state: { missionId: missionId, success: false, allComments: commentsRef.current, missionTitle: missionData?.title } })}
              disabled={isMissionOver}
            >
              (디버그) 실패 씬 이동
            </Button>
          </div>
          */}
          {/* --- 디버그 버튼 끝 --- */}

          {/* 임시 댓글 요청 버튼 (주석 처리됨) */}
          {/*
          <Button
            // 임시 댓글 요청 버튼은 triggerGenerateComments 훅을 직접 사용하도록 수정 가능
            // onClick={() => triggerGenerateComments(missionData, commentsRef.current ?? [], { likes: articleLikes, dislikes: articleDislikes })}
            // disabled={isGeneratingComments || isMissionOver}
            // className="mt-4 w-full"
          >
            {isGeneratingComments ? '댓글 생성 중...' : '(디버그) 임시 댓글 요청'}
          </Button>
          */}
          {/* --- 임시 댓글 요청 버튼 끝 --- */}
          <button
            onClick={toggleMonologueVisibility}
            style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 10 }}
          >
            {isMonologueVisible ? '독백 숨기기' : '독백 보이기'}
          </button>
        </div>

        {/* mainContentArea */}
        <div ref={mainContentAreaRef} className={styles.mainContentArea}>
          {/* 로딩 오버레이 추가 */}
          {isGeneratingComments && (
            <div className={styles.loadingOverlay}>
              {/* 필요하다면 로딩 스피너나 메시지 추가 */}
            </div>
          )}
          <div className={styles.siteHeader}>acoutside.com 갤러리</div>
          <h2 className={styles.header}>연예인 갤러리</h2>
          {/* missionData null 체크 추가 */}
          <div className={styles.articleTitle}>{missionData?.articleTitle ?? '기사 제목 없음'}</div>
          <div className={styles.articleMeta}>
            <span>ㅇㅇ(118.235)</span> | <span>{missionData?.articleCreatedAt ? new Date(missionData.articleCreatedAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '시간 정보 없음'}</span>
          </div>

          {/* ArticleContent에 missionData의 내용 전달 (null 체크 추가) */}
          <ArticleContent
            content={missionData?.articleContent ?? ''}
            imageFilename={missionData?.articleImage}
          />

          {/* ArticleReactions에 articleLikes, articleDislikes 및 핸들러 전달 */}
          <ArticleReactions
            likes={articleLikes}
            dislikes={articleDislikes}
            onLike={handleLikeArticle}
            onDislike={handleDislikeArticle}
          />

          <div className={styles.commentListSection}>
            <div className={styles.commentListHeader}>
              {/* 댓글 수 표시 */}
              <div className={styles.commentCount}>
                전체 댓글 <span className={styles.countNumber}>{comments.length}</span>개
              </div>
              <div className={styles.headerControls}>
                {/* 정렬 드롭다운 (useCommentState의 sortOrder, handleSortChange 사용) */}
                <select className={styles.sortDropdown} value={sortOrder} onChange={handleSortChange}>
                  <option value="등록순">등록순</option>
                  <option value="최신순">최신순</option>
                  {/* <option value="답글순">답글순</option> */} {/* 답글순 정렬 로직 구현 필요 */}
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
            {/* CommentList에 comments, isVisible, handleReplySubmit 전달 */}
            <CommentList
              comments={comments}
              isVisible={isCommentListVisible}
              onReplySubmit={handleReplySubmit} // 수정된 핸들러 전달
            />
            {/* 댓글 목록 푸터 */}
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

          {/* CommentInput에 handleCommentSubmit 및 비활성화 조건 전달 */}
          <div className={styles.commentInputSection}>
            <CommentInput onSubmit={handleCommentSubmit} disabled={isMissionOver || attemptsLeft <= 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentScene;
