import React, { useState, useEffect, useRef, useCallback } from "react"; // useCallback 추가
import { useParams, useNavigate } from "react-router-dom";
// import styles from "./InstagramActivityScene.module.css"; // 새 CSS 모듈 경로 (아직 없음)
import gameStyles from "./StoryScene.module.css"; // 공통 스타일은 유지

// 필요한 타입 import
import { Comment, ArticleReactions as ArticleReactionsType } from "../types"; // Opinion 제거 (인스타그램 씬에서는 직접 사용 안 함)

// 필요한 컴포넌트 import (인스타그램 UI 컴포넌트로 대체 예정)
// import MissionPanel from "./MissionPanel";
// import OpinionStats from "./OpinionStats";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";
// import MonologueBox from "./MonologueBox";
// import ArticleContent from "./ArticleContent";
// import ArticleReactions from "./ArticleReactions";

// Custom Hooks import
import useMissionData from "../hooks/useMissionData";
import useArticleState from "../hooks/useArticleState"; // 좋아요/싫어요 로직은 유지될 수 있음
import { useCommentStore } from "../stores/commentStore"; // 댓글 관련 로직은 유지
import { useMissionStore } from "../stores/missionStore";
import useGeminiComments from "../hooks/useGeminiComments"; // AI 댓글 생성 로직 유지

// 새로 생성한 인스타그램 UI 컴포넌트 import
import InstagramHeader from "./InstagramHeader";
import InstagramFeed from "./InstagramFeed";
import InstagramPostInput from "./InstagramPostInput";
import InstagramCommentList from "./InstagramCommentList"; // 댓글 목록 UI (필요시)
import ReactionStats from "./ReactionStats"; // 반응 통계 UI
import MissionPanel from "./MissionPanel"; // 미션 패널은 재사용 가능

interface InstagramActivitySceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const InstagramActivityScene: React.FC<InstagramActivitySceneProps> = ({
  onMissionComplete,
}) => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  // --- Custom Hooks 사용 (CommentScene과 동일) ---
  const {
    missionData,
    initialComments,
    initialOpinion, // Opinion은 내부적으로 사용될 수 있으므로 유지
    initialMonologue,
    totalAttempts,
    isLoading: isMissionLoading,
    error: missionError,
  } = useMissionData(missionId);

  const {
    articleLikes, // 좋아요/싫어요는 인스타그램에서도 필요
    articleDislikes,
    remainingAttempts: attemptsLeft,
    isCompleted: isMissionOver,
    decreaseAttempt: decrementAttempts,
    checkMissionCompletion,
    setMission,
  } = useMissionStore();

  // 좋아요/싫어요 관련 상태 및 핸들러 유지 (인스타그램 UI에서 사용 가능)
  const {
    opinion, // Opinion 상태는 내부 계산에 필요할 수 있음
    handleLikeArticle,
    handleDislikeArticle,
    setPredictedReactions,
  } = useArticleState(initialOpinion);

  const { comments, setComments, addComment, addReply } = useCommentStore();

  useEffect(() => {
    if (initialComments) {
      setComments(initialComments);
    }
  }, [initialComments, setComments]);

  useEffect(() => {
    if (missionData) {
      setMission(missionData);
    }
  }, [missionData, setMission]);

  // AI 댓글 생성 훅 유지
  const { isGeneratingComments, aiMonologue, triggerGenerateComments } =
    useGeminiComments();

  // 결과 처리 로직 유지
  const [missionResultMonologue, setMissionResultMonologue] = useState("");
  useEffect(() => {
    if (isMissionOver) {
      const success = useMissionStore
        .getState()
        .checkMissionCompletion(opinion);
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
    opinion,
    navigate,
  ]);

  // 독백 상태 관리 유지 (UI에서 표시 여부 결정)
  const [currentMonologue, setCurrentMonologue] = useState("");
  const prevIsGeneratingCommentsRef = useRef<boolean>(isGeneratingComments);

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
      // 인스타그램 씬에 맞는 독백으로 변경 가능
      setCurrentMonologue(
        `AI 반응 생성 완료. 피드를 확인해보자... (${comments.length}개의 댓글)`
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

  // --- 댓글/대댓글 제출 및 AI 연동 핸들러 (CommentScene과 동일) ---
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
        checkMissionCompletion(opinion);
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
      opinion,
    ]
  ); // 의존성 배열 업데이트

  // 인스타그램 '게시' 핸들러 (새로 추가)
  const handlePostSubmit = useCallback(
    async (postContent: string, image?: string) => {
      if (isMissionOver || attemptsLeft <= 0 || !missionData) return;

      // TODO: 실제 게시물 생성 로직 (Comment 타입 대신 Post 타입 사용 고려)
      // 예시: addComment를 임시로 사용하여 댓글 형태로 저장 및 AI 트리거
      console.log("Submitting post:", postContent, image);
      addComment(postContent, "플레이어"); // 임시: 플레이어 닉네임 사용
      const updatedComments = useCommentStore.getState().comments; // 댓글 스토어 사용 (임시)
      await handleSubmitAndGenerateAi(updatedComments);
    },
    [
      isMissionOver,
      attemptsLeft,
      missionData,
      addComment,
      handleSubmitAndGenerateAi,
    ]
  ); // 의존성 배열 업데이트

  // 댓글/답글 핸들러는 유지 (인스타그램 UI에서도 필요)
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
  ); // 의존성 배열 업데이트

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
  ); // 의존성 배열 업데이트

  // --- 로딩 및 오류 상태 표시 (CommentScene과 동일) ---
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
    // 2단 컬럼 레이아웃 적용 (flex)
    <div className="flex h-full bg-background font-neodgm">
      {/* 왼쪽 컬럼: 미션 패널 */}
      <aside className="w-1/4 border-r border-border p-4 overflow-y-auto">
        {" "}
        {/* 너비 조정 가능 */}
        <MissionPanel
          missionId={missionId || null}
          attemptsLeft={attemptsLeft}
          totalAttempts={totalAttempts}
        />
        {/* 독백은 왼쪽 패널 하단에 고정? */}
        {currentMonologue && (
          <div className="mt-4 p-2 bg-muted text-muted-foreground rounded text-sm">
            {currentMonologue}
          </div>
        )}
      </aside>

      {/* 오른쪽 컬럼: 인스타그램 UI */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstagramHeader />
        {/* 메인 콘텐츠 영역 (스크롤 가능) */}
        <main className="flex-1 overflow-y-auto">
          {/* 게시물 피드 */}
          {/* TODO: 실제 게시물 데이터를 생성하고 전달해야 함 (현재는 댓글 데이터를 임시 사용) */}
          <InstagramFeed posts={comments} />

          {/* 반응 통계 (피드 아래 또는 다른 위치) */}
          {/* <ReactionStats likes={articleLikes} commentsCount={comments.length} /> */}

          {/* 댓글 목록 (필요시 표시) */}
          {/* <InstagramCommentList comments={comments} onReplySubmit={handleReplySubmit} /> */}

          {/* 게시물 입력 */}
          <InstagramPostInput
            onSubmit={handlePostSubmit}
            disabled={
              isMissionOver || attemptsLeft <= 0 || isGeneratingComments
            }
          />

          {/* 로딩 또는 종료 상태 표시 */}
          {isGeneratingComments && (
            <div className="p-3 text-center text-muted-foreground">
              AI 반응 생성 중...
            </div>
          )}
          {isMissionOver && (
            <div className="p-3 text-center font-semibold">
              {missionResultMonologue}
            </div>
          )}
        </main>
        {/* TODO: 인스타그램 하단 네비게이션 바 */}
        {/* <footer className="flex justify-around p-3 border-t border-border bg-background"> ... </footer> */}
      </div>
    </div>
  );
};

export default InstagramActivityScene;
