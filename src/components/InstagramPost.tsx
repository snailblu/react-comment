import React, { useState } from "react"; // useCallback 제거
import { useTranslation } from "react-i18next"; // Import useTranslation
// import { Comment, Mission } from "../types"; // 사용하지 않으므로 제거
// import InstagramCommentList from "./InstagramCommentList";
// import InstagramPostInput from "./InstagramPostInput";
// import { useCommentStore } from "../stores/commentStore"; // 사용하지 않으므로 제거
import { useMissionStore } from "../stores/missionStore"; // 좋아요/싫어요 상태 가져오기
import { useGameState } from "../stores/gameStateStore"; // 댓글 오버레이 액션 가져오기
import useArticleState from "../hooks/useArticleState"; // 좋아요/싫어요 핸들러 가져오기 (임시)
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react"; // MoreHorizontal 아이콘 import 추가
// import styles from './InstagramPost.module.css'; // 필요시 CSS 모듈 생성

interface InstagramPostProps {
  nickname: string;
  profileImageUrl?: string;
  imageUrl?: string;
  caption: string;
  // likes prop 제거 (missionStore에서 가져옴)
  createdAt: string;
  missionId: string;
  // comments prop 제거
}

const InstagramPost: React.FC<InstagramPostProps> = ({
  nickname,
  profileImageUrl,
  imageUrl,
  caption,
  createdAt,
  missionId,
}) => {
  const { t } = useTranslation("instagramPost"); // Initialize useTranslation
  // const { comments, addReply } = useCommentStore();
  const { articleLikes } = useMissionStore(); // articleDislikes 제거
  const { openCommentOverlay } = useGameState();
  // TODO: 좋아요/싫어요 핸들러를 missionStore 또는 별도 훅에서 가져오도록 수정 필요
  // 임시로 useArticleState 사용
  const { handleLikeArticle } = useArticleState(); // handleDislikeArticle 제거

  // 댓글 표시 상태 제거
  // const [showComments, setShowComments] = useState(false);
  // 캡션 더보기 상태 추가
  const [showFullCaption, setShowFullCaption] = useState(false);

  // 댓글 제출 핸들러 제거 (오버레이에서 처리)
  /*
  const handleCommentSubmit = useCallback(
    async (commentText: string, nickname?: string) => { ... }, []);
  */

  // 답글 제출 핸들러 제거 (오버레이에서 처리)
  /*
  const handleReplySubmit = useCallback( ... , [addReply]);
  */

  const captionLimit = 50; // 캡션 미리보기 글자 수 제한

  return (
    <div className="border border-border rounded bg-card text-card-foreground overflow-hidden mb-4">
      {" "}
      {/* 하단 마진 추가 */}
      {/* 게시물 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {" "}
        {/* justify-between 추가 */}
        <div className="flex items-center">
          {" "}
          {/* 프로필 이미지와 닉네임 그룹 */}
          {/* TODO: 사용자 프로필 이미지 */}
          <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
          {/* text-outline-black -> text-stroke-black */}
          <span className="text-stroke-black">{nickname}</span>
        </div>
        {/* 옵션 버튼 (...) */}
        <button className="hover:text-foreground">
          <MoreHorizontal size={20} />
        </button>
      </div>
      {/* 게시물 이미지 (있을 경우) */}
      {imageUrl && (
        <img src={imageUrl} alt="게시물 이미지" className="w-full h-auto" />
      )}
      {/* 게시물 내용 및 액션 버튼 */}
      <div className="p-3">
        {/* 액션 버튼 */}
        <div className="flex items-center gap-3 text-muted-foreground mb-2">
          {/* lucide-react 아이콘 사용 */}
          <button onClick={handleLikeArticle} className="hover:text-foreground">
            <Heart size={24} />{" "}
            {/* TODO: 좋아요 상태에 따라 채워진 아이콘 표시 */}
          </button>
          {/* 댓글 아이콘 클릭 시 오버레이 열기 */}
          <button
            onClick={() => openCommentOverlay(missionId)}
            className="hover:text-foreground"
          >
            <MessageCircle size={24} />
          </button>
          <button className="hover:text-foreground">
            <Send size={24} /> {/* Send 또는 Share2 */}
          </button>
          <button className="ml-auto hover:text-foreground">
            <Bookmark size={24} />{" "}
            {/* TODO: 저장 상태에 따라 채워진 아이콘 표시 */}
          </button>
        </div>

        {/* 좋아요 표시 (프로필 사진 + 텍스트) */}
        {articleLikes > 0 && (
          <div className="flex items-center gap-2 pb-1 text-sm">
            {/* TODO: 실제 좋아요 누른 사용자 프로필 이미지 표시 (최대 3개?) */}
            <div className="flex -space-x-2">
              <img
                className="w-5 h-5 rounded-full border-2 border-background"
                src="/default_profile_icon.png"
                alt="User 1"
              />
              <img
                className="w-5 h-5 rounded-full border-2 border-background"
                src="/default_profile_icon.png"
                alt="User 2"
              />
            </div>
            {/* Use translation key with interpolation and pluralization */}
            {t("likesCount", {
              user: "Grace", // TODO: Replace with actual liker name if available
              count: articleLikes - 1,
            })}
          </div>
        )}

        {/* 캡션 (게시물 내용) - 더보기 기능 추가 */}
        <div className="mb-2 text-sm">
          {" "}
          {/* 텍스트 크기 조정 */}
          {/* text-outline-black -> text-stroke-black */}
          <span className="text-stroke-black mr-1">{nickname}</span>
          {caption.length > captionLimit && !showFullCaption ? (
            <>
              {caption.substring(0, captionLimit)}...
              <button
                onClick={() => setShowFullCaption(true)}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                {t("seeMore")} {/* Use translation key */}
              </button>
            </>
          ) : (
            caption
          )}
        </div>

        {/* 댓글 목록 및 입력창 제거 (오버레이에서 표시) */}

        {/* 게시 시간 */}
        <div className="pt-2 text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default InstagramPost;
