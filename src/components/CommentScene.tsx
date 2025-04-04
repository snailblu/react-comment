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
import { useTranslation } from "react-i18next"; // Import useTranslation
import useGeminiComments from "../hooks/useGeminiComments";
import useMonologueManager from "../hooks/useMonologueManager";

interface CommentSceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const CommentScene: React.FC<CommentSceneProps> = ({ onMissionComplete }) => {
  const { t } = useTranslation("commentScene"); // Initialize useTranslation
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
    checkMissionCompletion, // checkMissionCompletion 다시 추가
    setMission,
    opinion, // opinion 상태 직접 가져오기
    missionSuccess, // missionSuccess 상태 추가
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

  // --- 독백 관리 훅 사용 ---
  const { currentMonologue, isMonologueVisible, toggleMonologueVisibility } =
    useMonologueManager({
      isMissionLoading,
      missionError,
      initialMonologue,
      isGeneratingComments,
      aiMonologue,
      isMissionOver,
      commentsLength: comments.length,
    });

  // --- 미션 결과 처리 로직 수정 ---
  useEffect(() => {
    // isMissionOver가 true이고 missionSuccess가 결정되었을 때 (null이 아닐 때) 네비게이션 실행
    if (isMissionOver && missionSuccess !== null) {
      const navigateToResult = () => {
        console.log("Navigating to result scene... Success:", missionSuccess); // 스토어의 missionSuccess 사용
        navigate("/result", {
          state: {
            missionId,
            success: missionSuccess, // 스토어의 missionSuccess 사용
            missionTitle: missionData?.title,
            allComments: comments, // 댓글 기록 추가
          },
        });
        if (onMissionComplete) {
          onMissionComplete(missionSuccess ?? false); // missionSuccess 사용
        }
      };
      // 독백이 표시된 후 결과 화면으로 이동하도록 타이머 설정
      const timer = setTimeout(navigateToResult, 2000); // 2초 후 이동
      return () => clearTimeout(timer);
    }
  }, [
    isMissionOver,
    missionSuccess, // 의존성 배열에 missionSuccess 추가
    missionId,
    missionData?.title,
    onMissionComplete,
    navigate,
    comments, // comments 의존성 추가
  ]);

  // --- UI 상태 ---
  const [isCommentListVisible, setIsCommentListVisible] = useState(true);
  const mainContentAreaRef = useRef<HTMLDivElement>(null);

  // --- UI 관련 핸들러 ---
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
            // Check if newComment is a valid comment object (e.g., has a 'content' property)
            // and not the reaction prediction object mistakenly included in the array.
            if (
              typeof newComment === "object" &&
              newComment !== null &&
              "content" in newComment
            ) {
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
                      newCommentsList[insertionIndex].parentId ===
                        actualParentId
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
            } else {
              // If it's not a valid comment (likely the reaction object), skip it.
              console.warn(
                "Skipping invalid item in generatedComments:",
                newComment
              );
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
        checkMissionCompletion(); // checkMissionCompletion 호출
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
      checkMissionCompletion, // 의존성 배열에 추가
    ]
  );

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
        {t("loadingMission")}
      </div>
    );
  }
  if (missionError) {
    // Assuming missionError might already be translated by useMissionData
    return (
      <div className={gameStyles.storySceneContainer}>
        {t("errorPrefix")}
        {missionError}
      </div>
    );
  }
  if (!missionData) {
    return (
      <div className={gameStyles.storySceneContainer}>
        {t("errorMissionNotFound")}
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
          {/* Pass mission data and loading state to MissionPanel */}
          <MissionPanel
            mission={missionData}
            isLoading={isMissionLoading}
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
            {isMonologueVisible ? t("hideMonologue") : t("showMonologue")}
          </button>
        </div>
        <div ref={mainContentAreaRef} className={styles.mainContentArea}>
          {/* 로딩 오버레이 추가 (CommentOverlay와 유사하게) */}
          {isGeneratingComments && (
            <div className={styles.loadingOverlay}>
              {t("generatingComments")}
            </div>
          )}
          {/* 기존 헤더 제거 또는 수정 */}
          {/* <div className={styles.siteHeader}>acoutside.com 갤러리</div> */}
          {/* <h2 className={styles.header}>연예인 갤러리</h2> */}
          <div className={styles.articleTitle}>
            {" "}
            {/* 제목 스타일 유지 */}
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
                {t("totalCommentsPrefix")} {/* Translate */}
                <span className={styles.countNumber}>{comments.length}</span>
                {t("totalCommentsSuffix")} {/* Translate */}
              </div>
              <div className={styles.headerControls}>
                <select
                  className={styles.sortDropdown}
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <option value="등록순">{t("sortRegistered")}</option>{" "}
                  {/* Translate */}
                  <option value="최신순">{t("sortLatest")}</option>{" "}
                  {/* Translate */}
                </select>
                <span className={styles.listControls}>
                  <button
                    onClick={scrollToTop}
                    className={styles.controlButton}
                  >
                    {t("viewArticle")} {/* Translate */}
                  </button>{" "}
                  |
                  <button
                    onClick={toggleCommentList}
                    className={styles.controlButton}
                  >
                    {isCommentListVisible
                      ? t("closeComments")
                      : t("openComments")}{" "}
                    {/* Translate */}
                  </button>{" "}
                  |
                  <button
                    onClick={refreshComments}
                    className={styles.controlButton}
                  >
                    {t("refresh")} {/* Translate */}
                  </button>
                </span>
              </div>
            </div>
            {/* isVisible prop 다시 추가 */}
            {isCommentListVisible && (
              <CommentList
                comments={comments}
                isVisible={isCommentListVisible} // isVisible prop 추가
                onReplySubmit={handleReplySubmit}
              />
            )}
            {/* 댓글 목록 푸터 (isCommentListVisible 조건 추가) */}
            {isCommentListVisible && comments.length > 0 && (
              <div className={styles.commentListFooter}>
                <span className={styles.listControls}>
                  <button
                    onClick={scrollToTop}
                    className={styles.controlButton}
                  >
                    {t("viewArticle")} {/* Translate */}
                  </button>{" "}
                  |
                  <button
                    onClick={toggleCommentList}
                    className={styles.controlButton}
                  >
                    {isCommentListVisible
                      ? t("closeComments")
                      : t("openComments")}{" "}
                    {/* Translate */}
                  </button>{" "}
                  |
                  <button
                    onClick={refreshComments}
                    className={styles.controlButton}
                  >
                    {t("refresh")} {/* Translate */}
                  </button>
                </span>
              </div>
            )}
          </div>
          {/* 댓글 입력 섹션 (isCommentListVisible 조건 추가 및 닫는 태그 수정) */}
          {isCommentListVisible && (
            <div className={styles.commentInputSection}>
              <CommentInput
                onSubmit={handleCommentSubmit}
                disabled={isMissionOver || attemptsLeft <= 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentScene;
