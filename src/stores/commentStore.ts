import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import i18n from "../i18n"; // Import i18n instance
import { Comment, Opinion } from "../types";

interface CommentState {
  comments: Comment[];
  opinionScore: Opinion;
  // TODO: 댓글 관련 추가 상태 정의
}

interface CommentActions {
  setComments: (comments: Comment[]) => void;
  addComment: (commentText: string, nickname?: string, ip?: string) => void;
  addReply: (
    replyContent: string,
    parentId: string,
    nickname?: string,
    ip?: string
  ) => void;
  updateOpinionScore: (change: Partial<Opinion>) => void;
  // TODO: 댓글 관련 추가 액션 정의
}

// Function to get translated player nickname
const getPlayerNickname = () => {
  // Use 'common' namespace or create a new one if preferred
  // Ensure i18n is initialized before calling this, might need adjustment if called too early
  try {
    return i18n.t("common:playerNickname", { defaultValue: "Player" });
  } catch (error) {
    console.error("Error getting translated nickname, falling back.", error);
    return "Player"; // Fallback nickname
  }
};

export const useCommentStore = create<CommentState & CommentActions>((set) => ({
  comments: [],
  opinionScore: { positive: 0, negative: 0 }, // 초기 여론 점수
  // TODO: 추가 상태 초기값 설정

  setComments: (comments) => set({ comments: comments }),

  // Modify addComment action to use getPlayerNickname for default
  addComment: (commentText, nickname, ip = "127.0.0.1") =>
    set((state) => {
      const finalNickname = nickname ?? getPlayerNickname(); // Use translated default
      const newComment: Comment = {
        id: uuidv4(),
        nickname: finalNickname,
        ip: ip,
        content: commentText,
        likes: 0,
        is_player: true, // Player comments are always marked as such
        isReply: false,
        parentId: undefined,
        created_at: new Date().toISOString(),
      };
      return { comments: [...state.comments, newComment] };
    }),

  // Modify addReply action to use getPlayerNickname for default
  addReply: (replyContent, parentId, nickname, ip = "127.0.0.1") =>
    set((state) => {
      const finalNickname = nickname ?? getPlayerNickname(); // Use translated default
      const newReply: Comment = {
        id: uuidv4(),
        nickname: finalNickname,
        ip: ip,
        content: replyContent,
        likes: 0,
        is_player: true, // Player replies are also marked as player actions
        isReply: true,
        parentId: parentId,
        created_at: new Date().toISOString(),
      };

      const parentIndex = state.comments.findIndex(
        (comment) => comment.id === parentId
      );
      let newCommentsList: Comment[];

      if (parentIndex === -1) {
        console.error(
          `Parent comment with id ${parentId} not found. Appending reply to the end.`
        );
        newCommentsList = [...state.comments, newReply];
      } else {
        let insertionIndex = parentIndex + 1;
        while (
          insertionIndex < state.comments.length &&
          state.comments[insertionIndex].isReply &&
          state.comments[insertionIndex].parentId === parentId
        ) {
          insertionIndex++;
        }
        newCommentsList = [...state.comments];
        newCommentsList.splice(insertionIndex, 0, newReply);
      }
      return { comments: newCommentsList };
    }),

  updateOpinionScore: (change) =>
    set((state) => ({
      opinionScore: {
        positive: state.opinionScore.positive + (change.positive || 0),
        negative: state.opinionScore.negative + (change.negative || 0),
      },
    })),
  // TODO: 추가 액션 구현
}));

// Remove the incorrect setState call outside the store definition
// useCommentStore.setState((state) => ({ ... }));
