import React, { useState, useEffect, useRef, useCallback } from "react"; // useCallback 추가
import { useParams, useNavigate } from "react-router-dom";
// import styles from "./InstagramActivityScene.module.css"; // 새 CSS 모듈 경로 (아직 없음)
import gameStyles from "./StoryScene.module.css"; // 공통 스타일은 유지

// 필요한 타입 import
import { Comment, ArticleReactions as ArticleReactionsType } from "../types"; // Opinion 제거 (인스타그램 씬에서는 직접 사용 안 함)

// Custom Hooks import
import useMissionData from "../hooks/useMissionData";
import useArticleState from "../hooks/useArticleState"; // 좋아요/싫어요 로직은 유지될 수 있음
import { useCommentStore } from "../stores/commentStore"; // 댓글 관련 로직은 유지
import { useMissionStore } from "../stores/missionStore";
// import useGeminiComments from "../hooks/useGeminiComments"; // CommentOverlay에서 사용하므로 제거

// 새로 생성한 인스타그램 UI 컴포넌트 import
import InstagramHeader from "./InstagramHeader";
import InstagramFeed from "./InstagramFeed";
// import InstagramPostInput from "./InstagramPostInput"; // Post 내부에서 사용
// import InstagramCommentList from "./InstagramCommentList"; // Post 내부에서 사용
import ReactionStats from "./ReactionStats"; // 반응 통계 UI
import MissionPanel from "./MissionPanel"; // 미션 패널은 재사용 가능
import BottomNavBar from "./BottomNavBar"; // 하단 네비게이션 바 import 추가
import StoriesBar from "./StoriesBar"; // 스토리 바 import 추가
import CommentOverlay from "./CommentOverlay"; // 댓글 오버레이 import 추가

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

  // 좋아요/싫어요 관련 핸들러만 가져옴
  const { handleLikeArticle, handleDislikeArticle, setPredictedReactions } =
    useArticleState(); // initialOpinion 인자 제거

  // opinion 상태는 missionStore에서 직접 가져옴
  // const { opinion } = useMissionStore(); // checkMissionCompletion에서 opinion 사용 안 함

  const { comments, setComments } = useCommentStore(); // addComment, addReply 제거

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

  // AI 댓글 생성 훅 제거 (CommentOverlay에서 사용)
  // const { isGeneratingComments, aiMonologue, triggerGenerateComments } = useGeminiComments();
  // isGeneratingComments 상태는 gameStateStore 등에서 관리하거나, CommentOverlay 내부에서 관리하도록 변경 필요
  const isGeneratingComments = false; // 임시값
  const aiMonologue = ""; // 임시값

  // 결과 처리 로직 유지
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
    // opinion, // opinion은 더 이상 이 useEffect의 의존성이 아님 (missionStore에서 관리)
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
    // aiMonologue, // 제거됨
    initialMonologue,
    isGeneratingComments, // 임시값 사용
    comments.length,
  ]);

  // 댓글/답글 관련 핸들러 제거 (CommentOverlay에서 처리)
  // const handleSubmitAndGenerateAi = useCallback( ... );
  // const handleCommentSubmit = useCallback( ... );
  // const handleReplySubmit = useCallback( ... );

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
        <StoriesBar /> {/* 스토리 바 추가 */}
        {/* 메인 콘텐츠 영역 (스크롤 가능) */}
        <main className="flex-1 overflow-y-auto">
          {/* 게시물 피드 */}
          <InstagramFeed missionData={missionData} />{" "}
          {/* posts={comments} -> missionData={missionData} */}
          {/* 반응 통계 */}
          <ReactionStats likes={articleLikes} commentsCount={comments.length} />
          {/* 댓글 목록 및 입력창은 InstagramPost 내부에서 조건부 렌더링되므로 제거 */}
          {/* <InstagramCommentList ... /> */}
          {/* <InstagramPostInput ... /> */}
          {/* 로딩 또는 종료 상태 표시 */}
          {/* isGeneratingComments 상태 관리 방식 변경 필요 */}
          {/* {isGeneratingComments && ( ... )} */}
          {isMissionOver && (
            <div className="p-3 text-center font-semibold">
              {missionResultMonologue}
            </div>
          )}
        </main>
        {/* 하단 네비게이션 바 추가 */}
        <BottomNavBar />
      </div>

      {/* 댓글 오버레이 (조건부 렌더링) */}
      <CommentOverlay />
    </div>
  );
};

export default InstagramActivityScene;
