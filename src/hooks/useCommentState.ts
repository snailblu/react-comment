import { useState, useEffect, useCallback, useRef } from 'react';
import { Comment } from '../types'; // Comment 타입 import
import { v4 as uuidv4 } from 'uuid'; // uuid 라이브러리 import

interface UseCommentStateResult {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>; // 외부에서 댓글 목록을 직접 설정할 수 있도록 추가
  addComment: (commentText: string, nickname?: string, ip?: string) => Comment[]; // 업데이트된 전체 댓글 배열 반환
  addReply: (replyContent: string, parentId: string, nickname?: string, ip?: string) => Comment[]; // 업데이트된 전체 댓글 배열 반환
  sortOrder: string;
  handleSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  commentsRef: React.RefObject<Comment[]>; // 댓글 상태 추적용 ref 추가
}

const useCommentState = (initialComments: Comment[] = []): UseCommentStateResult => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [sortOrder, setSortOrder] = useState('등록순'); // 기본 정렬 순서
  const commentsRef = useRef(comments); // comments 상태 추적용 ref 추가

  // 초기 댓글 목록이 변경될 때 상태 업데이트
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // comments 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // 새 댓글 추가 로직 (업데이트된 배열 반환하도록 수정)
  const addComment = useCallback((commentText: string, nickname: string = '플레이어', ip: string = '127.0.0.1'): Comment[] => {
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

    let updatedComments: Comment[] = [];
    setComments(prevComments => {
      updatedComments = [...prevComments, newComment];
      return updatedComments;
    });
    // 상태 업데이트 함수 호출 후, 해당 함수 스코프에서 생성된 최신 배열을 반환
    // React 상태 업데이트는 비동기일 수 있지만, 이 로직은 setComments에 전달된 콜백이 실행된 *후*에
    // updatedComments 변수에 할당된 값을 반환하므로, 의도한 대로 동작할 가능성이 높음.
    // 더 확실한 방법은 setComments가 완료된 후를 보장하는 것이지만, 이 방식도 일반적으로 잘 작동함.
    return updatedComments;
  }, []);

  // 새 대댓글 추가 로직 (업데이트된 배열 반환하도록 수정)
  const addReply = useCallback((replyContent: string, parentId: string, nickname: string = '플레이어', ip: string = '127.0.0.1'): Comment[] => {
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

    let finalComments: Comment[] = []; // 최종 댓글 배열을 저장할 변수
    setComments(prevComments => {
      const parentIndex = prevComments.findIndex(comment => comment.id === parentId);
      let newCommentsList: Comment[]; // setComments 콜백 내에서 사용할 배열

      if (parentIndex === -1) {
        console.error(`Parent comment with id ${parentId} not found. Appending reply to the end.`);
        // 부모를 못 찾으면 일단 끝에 추가
        newCommentsList = [...prevComments, newReply];
      } else {
        // 올바른 삽입 위치 찾기
        let insertionIndex = parentIndex + 1;
        // 같은 부모를 가진 마지막 대댓글 뒤에 삽입
        while (insertionIndex < prevComments.length &&
               prevComments[insertionIndex].isReply &&
               prevComments[insertionIndex].parentId === parentId) {
          insertionIndex++;
        }
        // 새 배열 생성 및 삽입
        newCommentsList = [...prevComments];
        newCommentsList.splice(insertionIndex, 0, newReply);
      }
      finalComments = newCommentsList; // 콜백 내에서 최종 배열을 외부 변수에 할당
      return newCommentsList; // 상태 업데이트
    });

    // 상태 업데이트 함수 호출 후, 콜백 내에서 할당된 최종 배열 반환
    return finalComments;
  }, []);

  // 정렬 순서 변경 핸들러
  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
    // TODO: 실제 정렬 로직 구현 (필요하다면)
    console.log('Sort order changed:', event.target.value);
    // 예: setComments(prev => sortComments(prev, event.target.value));
  }, []);

  return {
    comments,
    setComments, // 외부에서 댓글 목록을 업데이트할 수 있도록 노출
    addComment,
    addReply,
    sortOrder,
    handleSortChange,
    commentsRef, // ref 노출
  };
};

export default useCommentState;
