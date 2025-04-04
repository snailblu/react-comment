import React, { useState, useEffect, useRef, useCallback } from "react"; // useCallback 추가
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CommentScene.module.css";
import gameStyles from "./StoryScene.module.css";

// 필요한 타입 import
import { Comment, ArticleReactions as ArticleReactionsType } from "../types";

// 필요한 컴포넌트 import
import MissionPanel from "./MissionPanel";
import OpinionStats from "./OpinionStats";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import MonologueBox from "./MonologueBox";
import ArticleContent from "./ArticleContent";
import ArticleReactions from "./ArticleReactions";

// Custom Hooks import
import useMissionData from "../hooks/useMissionData";
import useArticleState from "../hooks/useArticleState";
import { useCommentStore } from "../stores/commentStore";
import { useMissionStore } from "../stores/missionStore";
import useGeminiComments from "../hooks/useGeminiComments";

interface CommentSceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const CommentScene: React.FC<CommentSceneProps> = ({ onMissionComplete }) => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  // --- Custom Hooks 사용 ---
  const {
    missionData,
    initialComments,
    initialOpinion, // 초기 opinion 값은 missionStore 초기화에 사용될 수 있음
    initialMonologue,
    totalAttempts,
    isLoading: isMissionLoading,
    error: missionError,
  } = useMissionData(missionId);

  // Get state and actions from missionStore
  const {
    articleLikes,
    articleDislikes,
    remainingAttempts: attemptsLeft,
    isCompleted: isMissionOver,
    decreaseAttempt: decrementAttempts,
    checkMissionCompletion,
    setMission,
    opinion, // opinion 상태 직접 가져오기
  } = useMissionStore();

  // useArticleState 호출 시 인자 제거 및 opinion 제거
  const { handleLikeArticle, handleDislikeArticle, setPredictedReactions } =
    useArticleState();

  const { comments, setComments, addComment, addReply } = useCommentStore();

  // Initialize comment store with initial comments from mission data
  useEffect(() => {
    if (initialComments) {
      setComments(initialComments);
    }
  }, [initialComments, setComments]);

  // Initialize mission store when missionData loads
  useEffect(() => {
    if (missionData) {
      setMission(missionData); // 스토어 상태 초기화 (opinion 포함)
    }
  }, [missionData, setMission]);

  // sortOrder와 handleSortChange는 로컬 상태로 관리
  const [sortOrder, setSortOrder] = useState("등록순");
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
    // TODO: 실제 정렬 로직 구현
    console.log("Sort order changed:", event.target.value);
  };

  const { isGeneratingComments, aiMonologue, triggerGenerateComments } =
    useGeminiComments();

  // missionResultMonologue 및 결과 처리 로직 (useEffect 사용)
  const [missionResultMonologue, setMissionResultMonologue] = useState("");
  useEffect(() => {
    if (isMissionOver) {
      // checkMissionCompletion 호출 시 인자 제거
      const success = useMissionStore.getState().checkMissionCompletion();
      setMissionResultMonologue(success ? "미션 성공!" : "미션 실패...");

      const navigateToResult = () => {
        console.log("Navigating to result scene... Success:", success);
        navigate("/result", {
          state: {
            missionId,
            success: success ?? false,
            missionTitle: missionData?.title,
          },
        });
        if (onMissionComplete) {
          onMissionComplete(success ?? false);
        }
      };
      const timer = setTimeout(navigateToResult, 2000);
      return () => clearTimeout(timer);
    } else {
      setMissionResultMonologue("");
    }
  }, [
    isMissionOver,
    missionId,
    missionData?.title,
    onMissionComplete,
    // opinion, // 의존성 제거
    navigate,
  ]);

  // --- UI 상태 ---
  const [currentMonologue, setCurrentMonologue] = useState("");
  const [isCommentListVisible, setIsCommentListVisible] = useState(true);
  const [isMonologueVisible, setIsMonologueVisible] = useState(true);
  const mainContentAreaRef = useRef<HTMLDivElement>(null);
  const prevIsGeneratingCommentsRef = useRef<boolean>(isGeneratingComments);

  // --- 독백 상태 관리 ---
  useEffect(() => {
    const wasGenerating = prevIsGeneratingCommentsRef.current;
    prevIsGeneratingCommentsRef.current = isGeneratingComments;

    if (isMissionLoading) {
      setCurrentMonologue("미션 데이터를 불러오는 중...");
    } else if (missionError) {
      setCurrentMonologue(`오류: ${missionError}`);
    } else if (missionResultMonologue) {
      setCurrentMonologue(missionResultMonologue);
    } else if (wasGenerating && !isGeneratingComments) {
      setCurrentMonologue(
        `댓글이 ${comments.length}개 달렸군. 어디 읽어볼까... `
      );
    } else if (aiMonologue) {
      setCurrentMonologue(aiMonologue);
    } else {
      setCurrentMonologue(initialMonologue ?? "");
    }
  }, [
    isMissionLoading,
    missionError,
    missionResultMonologue,
    aiMonologue,
    initialMonologue,
    isGeneratingComments,
    comments.length,
  ]);

  // --- UI 관련 핸들러 ---
  const toggleMonologueVisibility = () =>
    setIsMonologueVisible(!isMonologueVisible);
  const scrollToTop = () =>
    mainContentAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  const toggleCommentList = () =>
    setIsCommentListVisible(!isCommentListVisible);
  const refreshComments = () =>
    console.log("Refreshing comments (placeholder)...");

  // --- 댓글/대댓글 제출 및 AI 연동 핸들러 ---
  const handleSubmitAndGenerateAi = useCallback(
    async (submittedComments: Comment[]) => {
      if (
        !submittedComments ||
        submittedComments.length === 0 ||
        !missionData
      ) {
        console.error("handleSubmitAndGenerateAi: Invalid arguments.");
        return;
      }

      decrementAttempts();
      const currentAttempts = useMissionStore.getState().remainingAttempts;

      const currentReactions: ArticleReactionsType = {
        likes: articleLikes,
        dislikes: articleDislikes,
      };

      const aiResult = await triggerGenerateComments(
        missionData,
        submittedComments,
        currentReactions
      );

      if (!aiResult.error) {
        if (aiResult.generatedComments.length > 0) {
          const currentCommentsInStore = useCommentStore.getState().comments;
          let baseComments = [...currentCommentsInStore];
          let newCommentsList = [...baseComments];
          const tempGeneratedComments: Comment[] = [];

          aiResult.generatedComments.forEach((newComment) => {
            if (newComment.isReply && newComment.parentId) {
              const targetIdentifier = newComment.parentId;
              let actualParentId: string | undefined = undefined;
              let parentComment: Comment | undefined = undefined;

              parentComment = [
                ...newCommentsList,
                ...tempGeneratedComments,
              ].find((c) => c.id === targetIdentifier);
              if (!parentComment) {
                parentComment = [
                  ...newCommentsList,
                  ...tempGeneratedComments,
                ].find((c) => c.nickname === targetIdentifier);
              }

              if (parentComment) {
                actualParentId = parentComment.id;
                newComment.parentId = actualParentId;
                const parentIndex = newCommentsList.findIndex(
                  (comment) => comment.id === actualParentId
                );
                if (parentIndex !== -1) {
                  let insertionIndex = parentIndex + 1;
                  while (
                    insertionIndex < newCommentsList.length &&
                    newCommentsList[insertionIndex].isReply &&
                    newCommentsList[insertionIndex].parentId === actualParentId
                  ) {
                    insertionIndex++;
                  }
                  newCommentsList.splice(insertionIndex, 0, newComment);
                } else {
                  tempGeneratedComments.push(newComment);
                }
              } else {
                console.warn(
                  `Parent comment target "${targetIdentifier}" provided by AI does not match any existing ID or Nickname. Appending reply as a regular comment.`
                );
                newComment.parentId = undefined;
                tempGeneratedComments.push(newComment);
              }
            } else {
              tempGeneratedComments.push(newComment);
            }
          });
          newCommentsList.push(
            ...tempGeneratedComments.filter(
              (tc) => !newCommentsList.some((nc) => nc.id === tc.id)
            )
          );
          setComments(newCommentsList);
        }

        if (aiResult.predictedAddedReactions) {
          setPredictedReactions(
            aiResult.predictedAddedReactions.added_likes,
            aiResult.predictedAddedReactions.added_dislikes
          );
        }
      }

      if (typeof currentAttempts === "number" && currentAttempts <= 0) {
        console.log(
          "Attempts depleted. Checking mission completion via store action."
        );
        checkMissionCompletion(); // 인자 없이 호출
      }
    },
    [
      decrementAttempts,
      missionData,
      articleLikes,
      articleDislikes,
      triggerGenerateComments,
      setComments,
      setPredictedReactions,
      checkMissionCompletion,
    ]
  ); // opinion 의존성 제거

  const handleCommentSubmit = useCallback(
    async (commentText: string, nickname?: string, password?: string) => {
      if (isMissionOver || attemptsLeft <= 0 || !missionData) return;
      addComment(commentText, nickname);
      const updatedComments = useCommentStore.getState().comments;
      await handleSubmitAndGenerateAi(updatedComments);
    },
    [
      isMissionOver,
      attemptsLeft,
      missionData,
      addComment,
      handleSubmitAndGenerateAi,
    ]
  );

  const handleReplySubmit = useCallback(
    async (
      replyContent: string,
      parentId: string,
      nickname?: string,
      password?: string
    ) => {
      if (isMissionOver || attemptsLeft <= 0 || !missionData) return;
      addReply(replyContent, parentId, nickname);
      const updatedComments = useCommentStore.getState().comments;
      await handleSubmitAndGenerateAi(updatedComments);
    },
    [
      isMissionOver,
      attemptsLeft,
      missionData,
      addReply,
      handleSubmitAndGenerateAi,
    ]
  );

  // --- 로딩 및 오류 상태 표시 ---
  if (isMissionLoading) {
    return (
      <div className={gameStyles.storySceneContainer}>
        미션 데이터를 불러오는 중...
      </div>
    );
  }
  if (missionError) {
    return (
      <div className={gameStyles.storySceneContainer}>오류: {missionError}</div>
    );
  }
  if (!missionData) {
    return (
      <div className={gameStyles.storySceneContainer}>
        미션 데이터를 찾을 수 없습니다.
      </div>
    );
  }

  // --- 렌더링 ---
  return (
    <div className={gameStyles.storySceneContainer}>
      {isMonologueVisible && currentMonologue && (
        <MonologueBox text={currentMonologue} />
      )}
      <div
        className={`${gameStyles.storyArea} ${styles.commentSceneWrapper}`}
        style={{ pointerEvents: isGeneratingComments ? "none" : "auto" }}
      >
        <div className={styles.leftSidePanel} style={{ pointerEvents: "auto" }}>
          <MissionPanel
            missionId={missionId || null}
            attemptsLeft={attemptsLeft}
            totalAttempts={totalAttempts}
          />
          <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} />
          <button
            onClick={toggleMonologueVisibility}
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              zIndex: 10,
            }}
          >
            {isMonologueVisible ? "독백 숨기기" : "독백 보이기"}
          </button>
        </div>
        <div ref={mainContentAreaRef} className={styles.mainContentArea}>
          {isGeneratingComments && (
            <div className={styles.loadingOverlay}></div>
          )}
          <div className={styles.siteHeader}>acoutside.com 갤러리</div>
          <h2 className={styles.header}>연예인 갤러리</h2>
          <div className={styles.articleTitle}>
            {missionData.articleTitle ?? "기사 제목 없음"}
          </div>
          <div className={styles.articleMeta}>
            <span>ㅇㅇ(118.235)</span> |{" "}
            <span>
              {missionData.articleCreatedAt
                ? new Date(missionData.articleCreatedAt)
                    .toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                    .replace(/\. /g, ".")
                    .replace(/\.$/, "")
                : "시간 정보 없음"}
            </span>
          </div>
          <ArticleContent
            content={missionData.articleContent ?? ""}
            imageFilename={missionData.articleImage}
          />
          <ArticleReactions
            likes={articleLikes}
            dislikes={articleDislikes}
            onLike={handleLikeArticle}
            onDislike={handleDislikeArticle}
          />
          <div className={styles.commentListSection}>
            <div className={styles.commentListHeader}>
              <div className={styles.commentCount}>
                전체 댓글{" "}
                <span className={styles.countNumber}>{comments.length}</span>개
              </div>
              <div className={styles.headerControls}>
                <select
                  className={styles.sortDropdown}
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <option value="등록순">등록순</option>
                  <option value="최신순">최신순</option>
                </select>
                <span className={styles.listControls}>
                  <button
                    onClick={scrollToTop}
                    className={styles.controlButton}
                  >
                    본문 보기
                  </button>{" "}
                  |
                  <button
                    onClick={toggleCommentList}
                    className={styles.controlButton}
                  >
                    댓글{isCommentListVisible ? "닫기 ▼" : "열기 ▲"}
                  </button>{" "}
                  |
                  <button
                    onClick={refreshComments}
                    className={styles.controlButton}
                  >
                    새로고침
                  </button>
                </span>
              </div>
            </div>
            <CommentList
              comments={comments}
              isVisible={isCommentListVisible}
              onReplySubmit={handleReplySubmit}
            />
            {isCommentListVisible && comments.length > 0 && (
              <div className={styles.commentListFooter}>
                <span className={styles.listControls}>
                  <button
                    onClick={scrollToTop}
                    className={styles.controlButton}
                  >
                    본문 보기
                  </button>{" "}
                  |
                  <button
                    onClick={toggleCommentList}
                    className={styles.controlButton}
                  >
                    댓글{isCommentListVisible ? "닫기 ▼" : "열기 ▲"}
                  </button>{" "}
                  |
                  <button
                    onClick={refreshComments}
                    className={styles.controlButton}
                  >
                    새로고침
                  </button>
                </span>
              </div>
            )}
          </div>
          <div className={styles.commentInputSection}>
            <CommentInput
              onSubmit={handleCommentSubmit}
              disabled={isMissionOver || attemptsLeft <= 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentScene;
