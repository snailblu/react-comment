import { create } from "zustand";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { Comment, Opinion } from "../types"; // Assuming types are defined in src/types

interface CommentState {
  comments: Comment[];
  opinionScore: Opinion;
  // TODO: 댓글 관련 추가 상태 정의
}

interface CommentActions {
  setComments: (comments: Comment[]) => void;
  // addComment now takes text and optional details, creates the comment object
  addComment: (commentText: string, nickname?: string, ip?: string) => void;
  // addReply takes text, parentId and optional details
  addReply: (
    replyContent: string,
    parentId: string,
    nickname?: string,
    ip?: string
  ) => void;
  updateOpinionScore: (change: Partial<Opinion>) => void;
  // TODO: 댓글 관련 추가 액션 정의
}

export const useCommentStore = create<CommentState & CommentActions>((set) => ({
  comments: [],
  opinionScore: { positive: 0, negative: 0 }, // 초기 여론 점수
  // TODO: 추가 상태 초기값 설정

  setComments: (comments) => set({ comments: comments }),

  addComment: (commentText, nickname = "플레이어", ip = "127.0.0.1") =>
    set((state) => {
      const newComment: Comment = {
        id: uuidv4(),
        nickname: nickname,
        ip: ip,
        content: commentText,
        likes: 0,
        is_player: true,
        isReply: false,
        parentId: undefined,
        created_at: new Date().toISOString(),
      };
      return { comments: [...state.comments, newComment] };
    }),

  addReply: (replyContent, parentId, nickname = "플레이어", ip = "127.0.0.1") =>
    set((state) => {
      const newReply: Comment = {
        id: uuidv4(),
        nickname: nickname,
        ip: ip,
        content: replyContent,
        likes: 0,
        is_player: true,
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
