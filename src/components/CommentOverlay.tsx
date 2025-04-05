import React, { useCallback } from "react"; // useCallback 추가, useEffect 제거
import { X } from "lucide-react"; // 닫기 아이콘
import InstagramCommentList from "./InstagramCommentList";
import InstagramPostInput from "./InstagramPostInput";
import { useGameState } from "../stores/gameStateStore";
import { useCommentStore } from "../stores/commentStore";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { useMissionStore } from "../stores/missionStore";
import useGeminiComments from "../hooks/useGeminiComments";
import useArticleState from "../hooks/useArticleState";
import { Comment, ArticleReactions as ArticleReactionsType } from "../types";
// import MonologueBox from "./MonologueBox"; // MonologueBox 컴포넌트 import 제거
// import useMonologueManager from "../hooks/useMonologueManager"; // 독백 관리 훅 import 제거
import styles from "./CommentOverlay.module.css"; // CSS 모듈 import

const CommentOverlay: React.FC = () => {
  const { t } = useTranslation("commentOverlay"); // Initialize useTranslation
  const { isCommentOverlayOpen, activePostIdForComments, closeCommentOverlay } =
    useGameState();
  // const missionId = activePostIdForComments; // 사용하지 않으므로 제거

  const { comments, addComment, addReply, setComments } = useCommentStore(); // addComment, setComments 추가
  const {
    currentMission: missionData, // missionStore에서 현재 미션 데이터 가져오기
    remainingAttempts: attemptsLeft,
    isCompleted: isMissionOver,
    decreaseAttempt: decrementAttempts,
    checkMissionCompletion,
    articleLikes, // AI 연동에 필요
    articleDislikes, // AI 연동에 필요
    // missionStore에서 초기 독백 가져오기 (CommentScene과 동일하게)
    // currentMission, // 사용하지 않으므로 제거
  } = useMissionStore();
  const { triggerGenerateComments } = useGeminiComments(); // isGeneratingComments 제거, aiMonologue 제거
  const { setPredictedReactions } = useArticleState(); // 예측 반응 설정 함수

  // --- 독백 관리 훅 호출 제거 ---
  // const { currentMonologue, isMonologueVisible, toggleMonologueVisibility } =
  //   useMonologueManager({ ... });

  // TODO: activePostIdForComments(missionId)를 사용하여 해당 게시물의 댓글만 필터링
  const filteredComments = comments; // 임시로 모든 댓글 표시

  // --- 댓글/대댓글 제출 및 AI 연동 핸들러 (ActivityScene에서 가져옴) ---
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
  );

  // 댓글 제출 핸들러
  const handleCommentSubmit = useCallback(
    async (commentText: string, nickname?: string) => {
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

  // 답글 제출 핸들러
  const handleReplySubmit = useCallback(
    async (replyContent: string, parentId: string, nickname?: string) => {
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

  // body 스크롤 제어 로직 제거
  // useEffect(() => { ... }, [isCommentOverlayOpen]);

  // isCommentOverlayOpen 상태가 false이면 null 반환 (애니메이션 위해 즉시 숨기지 않음)
  // if (!isCommentOverlayOpen) {
  //   return null;
  // }

  return (
    // 오버레이 배경
    <div
      className={`${styles.overlayBackdrop} ${
        isCommentOverlayOpen ? styles.overlayBackdropVisible : ""
      }`}
      onClick={closeCommentOverlay} // 배경 클릭 시 닫기
    >
      {/* 독백 박스 렌더링 제거 */}
      {/* {isMonologueVisible && currentMonologue && ( ... )} */}
      {/* 댓글 컨텐츠 영역 */}
      <div
        className={`${styles.commentContent} ${
          isCommentOverlayOpen ? styles.commentContentVisible : ""
        }`}
        onClick={(e) => e.stopPropagation()} // 컨텐츠 영역 클릭 시 닫히지 않도록 이벤트 전파 중단
      >
        {/* 오버레이 헤더 */}
        <div className={styles.header}>
          <h3 className={styles.title}>{t("title")}</h3>{" "}
          {/* Use translation key */}
          <button onClick={closeCommentOverlay} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* 댓글 목록 (스크롤 가능) */}
        <div className={styles.commentListContainer}>
          <InstagramCommentList
            comments={filteredComments}
            onReplySubmit={handleReplySubmit}
          />
        </div>

        {/* 댓글 입력 */}
        {/* TODO: disabled 상태 전달 필요 */}
        <InstagramPostInput onSubmitComment={handleCommentSubmit} />
      </div>
    </div>
  );
};

export default CommentOverlay;
