import React, { useEffect } from "react"; // useState, useRef, useCallback 제거
import { useParams, useNavigate } from "react-router-dom";
import styles from "./InstagramActivityScene.module.css"; // CSS 모듈 import 추가
import gameStyles from "./StoryScene.module.css"; // 공통 스타일은 유지

// 필요한 타입 import
// import { Comment, ArticleReactions as ArticleReactionsType } from "../types"; // 사용하지 않으므로 제거

// Custom Hooks import
import useMissionData from "../hooks/useMissionData";
import useArticleState from "../hooks/useArticleState"; // 좋아요/싫어요 로직은 유지될 수 있음
import { useCommentStore } from "../stores/commentStore"; // 댓글 관련 로직은 유지
import { useMissionStore } from "../stores/missionStore";
import useMonologueManager from "../hooks/useMonologueManager"; // 독백 관리 훅 import
import { playBgm, stopBgm } from "../utils/audioManager"; // audioManager 함수 import 추가

// 새로 생성한 인스타그램 UI 컴포넌트 import
import InstagramHeader from "./InstagramHeader";
import InstagramFeed from "./InstagramFeed";
// import InstagramPostInput from "./InstagramPostInput"; // Post 내부에서 사용
// import InstagramCommentList from "./InstagramCommentList"; // Post 내부에서 사용
import ReactionStats from "./ReactionStats"; // 반응 통계 UI
import MissionPanel from "./MissionPanel"; // 미션 패널은 재사용 가능
import OpinionStats from "./OpinionStats"; // 여론 패널 import 추가
import BottomNavBar from "./BottomNavBar"; // 하단 네비게이션 바 import 추가
import StoriesBar from "./StoriesBar"; // 스토리 바 import 추가
import { useTranslation } from "react-i18next"; // Import useTranslation
import CommentOverlay from "./CommentOverlay";
import MonologueBox from "./MonologueBox";

interface InstagramActivitySceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const InstagramActivityScene: React.FC<InstagramActivitySceneProps> = ({
  onMissionComplete,
}) => {
  const { t } = useTranslation("instagramScene"); // Initialize useTranslation
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  // --- Custom Hooks 사용 (CommentScene과 동일) ---
  const {
    missionData,
    // initialComments, // Removed, store initialized in useMissionData
    // initialOpinion, // 사용하지 않으므로 제거
    initialMonologue,
    totalAttempts,
    isLoading: isMissionLoading,
    error: missionError,
  } = useMissionData(missionId);

  const {
    articleLikes, // 좋아요/싫어요는 인스타그램에서도 필요
    // articleDislikes, // 사용하지 않으므로 제거
    remainingAttempts: attemptsLeft,
    isCompleted: isMissionOver,
    // decreaseAttempt: decrementAttempts, // 사용하지 않으므로 제거
    setMission,
    missionSuccess, // missionSuccess 상태 추가
    opinion, // opinion 상태는 missionStore에서 직접 가져옴
  } = useMissionStore();

  // 좋아요/싫어요 관련 핸들러만 가져옴
  // const { handleLikeArticle, handleDislikeArticle } = useArticleState(); // 사용하지 않으므로 제거
  useArticleState(); // Hook 호출은 유지 (내부 로직이 필요할 수 있음)

  const { comments } = useCommentStore(); // setComments, addComment, addReply 제거

  // useEffect(() => { // Removed, store initialized in useMissionData
  //   if (initialComments) {
  //     setComments(initialComments);
  //   }
  // }, [initialComments, setComments]);

  useEffect(() => {
    // Removed, store initialized in useMissionData
    if (missionData) {
      setMission(missionData);
    }
  }, [missionData]); // setMission 제거

  // AI 댓글 생성 관련 상태는 CommentOverlay에서 관리하므로 제거
  const isGeneratingComments = useMissionStore(
    (state) =>
      state.remainingAttempts < (missionData?.totalAttempts ?? 0) &&
      !state.isCompleted // AI 생성 중 상태 추정 (개선 필요)
  );
  const aiMonologue = null; // CommentOverlay에서 관리

  // --- 독백 관리 훅 사용 ---
  const {
    currentMonologue,
    isMonologueVisible,
  } = // toggleMonologueVisibility 제거
    useMonologueManager({
      isMissionLoading,
      missionError,
      initialMonologue,
      isGeneratingComments, // 추정된 값 사용
      aiMonologue, // null 전달
      isMissionOver,
      commentsLength: comments.length,
    });

  // 결과 처리 로직 수정
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
      const timer = setTimeout(navigateToResult, 2000); // 독백 표시 후 이동
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

  // BGM 재생/정지 로직 추가
  useEffect(() => {
    playBgm("mainTheme"); // 컴포넌트 마운트 시 mainTheme 재생
    return () => {
      stopBgm(); // 컴포넌트 언마운트 시 BGM 정지
    };
  }, []); // 빈 의존성 배열로 마운트/언마운트 시 한 번만 실행

  // 댓글/답글 관련 핸들러 제거 (CommentOverlay에서 처리)

  // --- 로딩 및 오류 상태 표시 (CommentScene과 동일) ---
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
    // 2단 컬럼 레이아웃 적용 (flex)
    <div className="flex h-full bg-background font-neodgm">
      {/* 왼쪽 컬럼: 미션 패널 */}
      <aside className="w-1/4 border-r border-border p-4 overflow-y-auto">
        {" "}
        {/* 너비 조정 가능 */}
        {/* Pass mission data and loading state instead of missionId */}
        <MissionPanel
          mission={missionData} // Pass translated mission data
          isLoading={isMissionLoading} // Pass loading state
          attemptsLeft={attemptsLeft}
          totalAttempts={totalAttempts}
        />
        {/* OpinionStats 컴포넌트 추가 (상단 마진 추가) */}
        <div className="mt-4">
          <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} />
        </div>
        {/* 왼쪽 패널 하단의 독백 관련 코드 완전 제거 */}
      </aside>

      {/* 오른쪽 컬럼: 인스타그램 UI */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {" "}
        {/* relative 추가 */}
        <InstagramHeader />
        <StoriesBar /> {/* 스토리 바 추가 */}
        {/* 독백 상자를 오른쪽 컬럼 상단으로 이동 */}
        {isMonologueVisible && currentMonologue && (
          <div className={styles.fixedMonologueContainer}>
            {" "}
            {/* 새 CSS 클래스 적용 */}
            <MonologueBox text={currentMonologue} />
          </div>
        )}
        {/* 메인 콘텐츠 영역 (스크롤 가능) */}
        {/* pt-16은 독백 상자 높이에 따라 조정 필요 */}
        <main className="flex-1 overflow-y-auto pt-16">
          {/* 게시물 피드 */}
          <InstagramFeed missionData={missionData} />{" "}
          {/* posts={comments} -> missionData={missionData} */}
          {/* 반응 통계 */}
          <ReactionStats likes={articleLikes} commentsCount={comments.length} />
          {/* 댓글 목록 및 입력창은 InstagramPost 내부에서 조건부 렌더링되므로 제거 */}
          {/* 로딩 또는 종료 상태 표시 */}
          {isGeneratingComments && (
            <div className="p-3 text-center text-muted-foreground">
              {t("generatingComments")}
            </div>
          )}
          {isMissionOver && (
            // useMonologueManager에서 반환된 currentMonologue 사용
            <div className="p-3 text-center font-semibold">
              {currentMonologue}
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
