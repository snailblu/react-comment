import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CommentScene.module.css';
import gameStyles from './StoryScene.module.css';
import { Mission } from '../types'; // Mission 타입 import 추가

// 필요한 다른 컴포넌트 import (예시)
import MissionPanel from './MissionPanel'; // MissionPanel import 활성화
import OpinionStats from './OpinionStats'; // OpinionStats import 활성화
import CommentList from './CommentList';
import CommentInput from './CommentInput';
import MonologueBox from './MonologueBox';
import ArticleContent from './ArticleContent';
import ArticleReactions from './ArticleReactions'; // ArticleReactions 컴포넌트 import 추가
import { Button } from './ui/button'; // 상대 경로로 다시 변경
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Gemini SDK import
import { generateCommentPrompt } from '../lib/promptGenerator'; // 프롬프트 생성 함수 import
import { Comment, Opinion } from '../types'; // Comment 및 Opinion 타입 import 위치 수정

// 필요한 Hook import (예시)
// import useGameState from '../hooks/useGameState';

// Gemini API 설정
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Gemini API Key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
}
const genAI = new GoogleGenerativeAI(API_KEY || ""); // API 키가 없으면 빈 문자열로 초기화 (오류 방지)
// 모델을 gemini-1.5-flash 로 변경
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 안전 설정 (필요에 따라 조정)
const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  // 괴롭힘 카테고리 차단 기준을 낮춤 (MEDIUM 허용, HIGH만 차단)
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

interface CommentSceneProps {
  onMissionComplete?: (success: boolean) => void;
}

const CommentScene: React.FC<CommentSceneProps> = ({ onMissionComplete }) => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [missionData, setMissionData] = useState<Mission | null>(null); // 미션 데이터 상태 추가
  const [opinion, setOpinion] = useState<Opinion>({ positive: 0, negative: 0, neutral: 0 }); // 초기값 0으로 설정
  const [comments, setComments] = useState<Comment[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(0); // 초기값 0으로 설정
  const [monologue, setMonologue] = useState('');
  const [isMissionOver, setIsMissionOver] = useState(false);
  const [isCommentListVisible, setIsCommentListVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState('등록순');
  const [isMonologueVisible, setIsMonologueVisible] = useState(true);
  const [isGeneratingComments, setIsGeneratingComments] = useState(false); // 댓글 생성 로딩 상태 추가
  const [articleLikes, setArticleLikes] = useState(0); // 기사 좋아요 상태 추가
  const [articleDislikes, setArticleDislikes] = useState(0); // 기사 싫어요 상태 추가
  const mainContentAreaRef = useRef<HTMLDivElement>(null);

  // --- 핸들러 함수들 ---
  const toggleMonologueVisibility = () => {
    setIsMonologueVisible(!isMonologueVisible);
  };

  const scrollToTop = () => {
    // gameAreaRef 대신 mainContentAreaRef를 사용하여 스크롤
    mainContentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCommentList = () => {
    setIsCommentListVisible(!isCommentListVisible);
  };

  const refreshComments = () => {
    // TODO: 실제 댓글 새로고침 로직 구현 (placeholder 모드에서는 임시)
    console.log('Refreshing comments (placeholder)...');
    // 예: fetchInitialComments();
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
    // TODO: 실제 정렬 로직 구현
    console.log('Sort order changed:', event.target.value);
  };

  // 기사 좋아요 핸들러
  const handleLikeArticle = useCallback(() => {
    setArticleLikes(prev => prev + 1);
    // TODO: 필요시 추가 로직 (예: 게임 플래그 변경 등)
  }, []);

  // 기사 싫어요 핸들러
  const handleDislikeArticle = useCallback(() => {
    setArticleDislikes(prev => prev + 1);
    // TODO: 필요시 추가 로직
  }, []);

  // 임시 댓글 생성 핸들러
  const handleGenerateComments = async () => {
    if (isGeneratingComments || isMissionOver || !missionData) return;

    setIsGeneratingComments(true);
    setMonologue('AI가 댓글을 생성하는 중...'); // 로딩 메시지

    if (!API_KEY) {
      setMonologue('오류: Gemini API 키가 설정되지 않았습니다.');
      setIsGeneratingComments(false);
      return;
    }

    try {
      console.log('Requesting AI comments for article:', missionData.articleTitle);

      // 분리된 함수를 사용하여 프롬프트 생성 (opinion 인자 제거)
      const prompt = generateCommentPrompt(
        missionData.articleTitle ?? '제목 없음',
        missionData.articleContent ?? '내용 없음',
        comments // 현재 댓글 목록 상태 전달
      );
      console.log("Generated Prompt for Gemini:", prompt); // 생성된 프롬프트 확인용 로그

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      // Log the full response for debugging, especially promptFeedback
      console.log("Full Gemini Response:", JSON.stringify(response, null, 2));

      let generatedText = response.text();

      if (!generatedText) {
        // Check for safety blocks
        if (response.promptFeedback?.blockReason) {
          console.error("Gemini request blocked due to safety settings:", response.promptFeedback.blockReason, response.promptFeedback.safetyRatings);
          throw new Error(`Gemini API 요청이 안전 설정에 의해 차단되었습니다: ${response.promptFeedback.blockReason}`);
        } else {
          // Other reasons for empty response
          console.error("Gemini API returned an empty response without a specific block reason.");
          throw new Error("Gemini API로부터 빈 응답을 받았습니다. (안전 차단 외 다른 이유)");
        }
      }

      // 응답 텍스트를 줄바꿈 기준으로 나누어 댓글 배열 생성
      const commentLines = generatedText.split('\n').map(c => c.trim()).filter(c => c.length > 0);

      // Comment 객체로 변환 (parentId 파싱 로직 추가)
      const generatedComments: Comment[] = [];
      commentLines.forEach((line, index) => {
        let isReply = false;
        let parentId: string | undefined = undefined;
        let textToParse = line;

        // 대댓글 형식 확인 및 parentId 추출 (-> [ID] 형식)
        const replyMatch = line.match(/^->\s*\[(.*?)\]\s*(.*)$/);
        if (replyMatch) {
          isReply = true;
          parentId = replyMatch[1].trim(); // 대괄호 안의 ID 추출
          textToParse = replyMatch[2].trim(); // ID 부분을 제외한 나머지 텍스트
        }

        // 닉네임(IP): 내용 형식 매칭
        const commentMatch = textToParse.match(/^(.+?)\((.*?)\):\s*(.*)$/);

        if (commentMatch) {
          const [, nickname, ip, content] = commentMatch;
          generatedComments.push({
            id: `ai-${Date.now()}-${index}`,
            nickname: nickname.trim(),
            ip: ip.trim(),
            content: content.trim(),
            likes: Math.floor(Math.random() * 10),
            is_player: false,
            isReply: isReply,
            parentId: parentId, // 추출한 parentId 설정
            created_at: new Date().toISOString(),
          });
        } else {
          // 형식이 맞지 않는 경우 (대댓글/일반댓글 모두)
          console.warn(`AI comment format mismatch, using full text as content: "${line}"`);
          generatedComments.push({
            id: `ai-${Date.now()}-${index}-fallback`,
            nickname: '익명AI',
            ip: '0.0.0',
            content: line, // 원본 라인 전체를 내용으로
            likes: Math.floor(Math.random() * 5),
            is_player: false,
            isReply: isReply, // 대댓글 여부는 유지될 수 있음
            parentId: parentId, // parentId도 유지될 수 있음
            created_at: new Date().toISOString(),
          });
        }
      });

      // 상태 업데이트 (대댓글 위치 조정 로직 추가)
      if (generatedComments.length === 0) {
        setMonologue('AI가 댓글을 생성하지 못했습니다. 다시 시도해주세요.');
      } else {
        // 새로운 댓글 목록을 생성하여 대댓글 위치 조정
        setComments((prevComments) => {
          let newCommentsList = [...prevComments]; // 시작은 이전 댓글 목록 복사

          generatedComments.forEach(newComment => {
            if (newComment.isReply && newComment.parentId) {
              // 대댓글 처리: 부모 댓글 찾기
              const parentIndex = newCommentsList.findIndex(comment => comment.id === newComment.parentId);

              if (parentIndex !== -1) {
                // 부모 댓글 찾음: 삽입 위치 계산 (부모 다음부터 마지막 대댓글 뒤까지)
                let insertionIndex = parentIndex + 1;
                while (insertionIndex < newCommentsList.length &&
                       newCommentsList[insertionIndex].isReply) {
                           // && newCommentsList[insertionIndex].parentId === newComment.parentId) { // 필요시 더 정확한 부모 확인
                  insertionIndex++;
                }
                // 찾은 위치에 대댓글 삽입
                newCommentsList.splice(insertionIndex, 0, newComment);
              } else {
                // 부모 댓글 못 찾음 (오류 또는 AI가 잘못된 ID 생성): 맨 뒤에 추가하고 경고
                console.warn(`Parent comment with ID ${newComment.parentId} not found for AI reply. Appending to the end.`);
                newCommentsList.push(newComment);
              }
            } else {
              // 일반 댓글 처리: 맨 뒤에 추가
              newCommentsList.push(newComment);
            }
          });

          return newCommentsList; // 최종적으로 정렬된 새 배열 반환
        });

        setMonologue(`AI가 ${generatedComments.length}개의 댓글(대댓글 포함)을 생성했습니다.`); // 메시지 수정
      }

      // 여론 상태 업데이트 로직 제거


    } catch (error) {
      console.error('Failed to generate AI comments:', error); // 오류 메시지 수정
      if (error instanceof Error) {
        setMonologue(`AI 처리 중 오류 발생: ${error.message}`);
      } else {
        setMonologue('AI 처리 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsGeneratingComments(false);
    }
  };

  // --- 미션 상태 체크 로직 ---
  const checkMissionStatus = useCallback((currentPositive: number, currentAttempts: number) => {
    if (isMissionOver || !missionData) return; // missionData 없으면 체크 중단

    if (currentPositive >= (missionData.goal?.positive ?? 100)) { // 목표값은 missionData에서 가져옴 (기본값 100)
      console.log('Mission Success!');
      setMonologue('미션 성공! 목표를 달성했다.'); // 성공 독백은 고정 또는 missionData에서 가져오도록 수정 가능
      setIsMissionOver(true);
      if (onMissionComplete) {
        onMissionComplete(true);
      } else {
        navigate('/result', { state: { missionId: missionId } });
      }
    } else if (currentAttempts <= 0) {
      console.log('Mission Failed!');
      setMonologue('실패했다... 시도 횟수를 다 써버렸어.'); // 실패 독백은 고정 또는 missionData에서 가져오도록 수정 가능
      setIsMissionOver(true);
      if (onMissionComplete) {
        onMissionComplete(false);
      } else {
         navigate('/ending', { state: { endingType: 'bad_ending' } });
      }
    }
  }, [isMissionOver, missionData, onMissionComplete, navigate, missionId]); // 의존성 배열에 missionData 추가


  // --- 데이터 로딩 (missions.json 사용) ---
  useEffect(() => {
    if (!missionId) {
      console.error("CommentScene: missionId is missing from URL parameters.");
      setMonologue("오류: 미션 정보를 찾을 수 없습니다.");
      setIsMissionOver(true);
      return;
    }

    const fetchMissionData = async () => {
      try {
        const response = await fetch('/missions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allMissions: Record<string, Mission> = await response.json();
        const currentMission = allMissions[missionId];

        if (!currentMission) {
          console.error(`CommentScene: Mission data not found for missionId: ${missionId}`);
          setMonologue("오류: 해당 미션 데이터를 찾을 수 없습니다.");
          setIsMissionOver(true);
          return;
        }

        console.log(`CommentScene: Initializing with data for mission ${missionId}`, currentMission);
        setMissionData(currentMission);

        // 초기 상태 설정
        setOpinion(currentMission.initialOpinion ?? { positive: 50, negative: 30, neutral: 20 }); // 기본값 설정
        setAttemptsLeft(currentMission.max_attempts ?? 5); // 기본값 설정
        setMonologue(currentMission.initialMonologue ?? '댓글을 달아 여론을 조작하자...'); // 기본값 설정
        setArticleLikes(currentMission.initialLikes ?? 0); // 초기 좋아요 설정
        setArticleDislikes(currentMission.initialDislikes ?? 0); // 초기 싫어요 설정

        // 초기 댓글 설정 (created_at 직접 사용)
        // const now = Date.now(); // 더 이상 필요 없음

        // initialComments 로드 시 타입 문제 해결 및 필수 필드 확인
        const loadedComments: Comment[] = (currentMission.initialComments ?? [])
          .filter(c => c.id && c.content && c.created_at) // id, content, created_at 필수 확인
          .map((c): Comment => ({ // 반환 타입을 명시적으로 Comment로 지정
            id: c.id!,
            nickname: c.nickname,
            ip: c.ip,
            isReply: c.isReply,
            content: c.content!,
            likes: c.likes ?? 0,
            is_player: c.is_player ?? false,
            created_at: c.created_at!, // missions.json의 created_at 값을 직접 사용
            // delay는 Comment 타입에 없으므로 포함하지 않음
          }));
        setComments(loadedComments);

        // 초기 미션 상태 체크 (주석 처리 - handleCommentSubmit에서 처리됨)
        // checkMissionStatus(
        //   currentMission.initialOpinion?.positive ?? 50,
        //   currentMission.max_attempts ?? 5
        // );

      } catch (error) {
        console.error("Failed to fetch mission data:", error);
        setMonologue("오류: 미션 데이터를 불러오는 데 실패했습니다.");
        setIsMissionOver(true);
      }
    };

    fetchMissionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId]); // 의존성 배열에서 checkMissionStatus 제거


  // --- 댓글 제출 핸들러 ---
  const handleCommentSubmit = async (commentText: string, nickname?: string, password?: string) => {
    if (isMissionOver || attemptsLeft <= 0 || !missionData) return; // missionData 체크 추가

    console.log('Submitting comment:', commentText, 'by', nickname || 'Default');

    // --- 임시 로컬 업데이트 로직 ---
    // 플레이어 댓글 IP는 고정값 또는 다른 규칙으로 설정 (예: '127.0.0.1')
    const playerIp = '127.0.0.1'; // 예시 고정 IP
    const newComment: Comment = {
      id: `player-${Date.now()}`,
      nickname: nickname,
      ip: playerIp, // 고정된 플레이어 IP 사용
      content: commentText,
      likes: 0,
      is_player: true,
      created_at: new Date().toISOString(),
    };

    setComments((prevComments) => [...prevComments, newComment]);

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    // 플레이어 댓글 제출 시 여론 업데이트 로직 제거
    // 여론은 handleGenerateComments 에서 AI 분석 결과로만 업데이트됨

    // 미션 상태 체크 (현재 opinion 상태와 변경된 시도 횟수 사용)
    // checkMissionStatus는 opinion 상태를 직접 읽으므로, opinion 값을 인자로 전달할 필요 없음
    checkMissionStatus(opinion.positive, newAttemptsLeft);
  };

  // --- 대댓글 제출 핸들러 ---
  const handleReplySubmit = (replyContent: string, parentId: string, nickname?: string, password?: string) => {
    if (isMissionOver || attemptsLeft <= 0 || !missionData) return;

    console.log(`Submitting reply to ${parentId}:`, replyContent, 'by', nickname || 'Default');

    const playerIp = '127.0.0.1'; // 플레이어 IP
    const newReply: Comment = {
      id: `player-reply-${Date.now()}`,
      nickname: nickname,
      ip: playerIp,
      content: replyContent,
      likes: 0,
      is_player: true,
      isReply: true, // 대댓글임을 표시
      // parentId: parentId, // 필요하다면 부모 ID 저장 (현재 Comment 타입에는 없음)
      created_at: new Date().toISOString(),
    };

    // 부모 댓글 바로 아래에 대댓글 삽입
    setComments((prevComments) => {
      const parentIndex = prevComments.findIndex(comment => comment.id === parentId);
      if (parentIndex === -1) {
        // 부모 댓글을 찾지 못한 경우 맨 뒤에 추가 (예외 처리)
        console.error(`Parent comment with id ${parentId} not found.`);
        return [...prevComments, newReply];
      }

      // 부모 댓글 다음부터 시작하여 마지막 대댓글 위치 찾기
      let insertionIndex = parentIndex + 1;
      for (let i = parentIndex + 1; i < prevComments.length; i++) {
        if (prevComments[i].isReply) {
          // 현재 댓글이 대댓글이면, 다음 위치를 삽입 후보로 업데이트
          insertionIndex = i + 1;
        } else {
          // 대댓글이 아닌 댓글을 만나면, 여기가 대댓글 블록의 끝이므로 반복 중단
          break;
        }
      }

      // 찾은 위치에 새로운 대댓글 삽입
      const newComments = [...prevComments];
      newComments.splice(insertionIndex, 0, newReply);
      return newComments;
    });

    // 시도 횟수 차감 및 미션 상태 체크 (일반 댓글과 동일하게 처리)
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);
    checkMissionStatus(opinion.positive, newAttemptsLeft);
  };


  // --- 로딩 상태 표시 ---
  if (!missionData) {
    return <div className={gameStyles.storySceneContainer}>Loading mission...</div>; // 간단한 로딩 표시
  }

  return (
    <div className={gameStyles.storySceneContainer}>
      {isMonologueVisible && monologue && (
        <MonologueBox text={monologue} />
      )}

      <div className={`${gameStyles.storyArea} ${styles.commentSceneWrapper}`}>
        <div className={styles.leftSidePanel}>
          <MissionPanel missionId={missionId || null} />
          <OpinionStats opinion={opinion} attemptsLeft={attemptsLeft} />
          {/* 임시 댓글 요청 버튼 추가 */}
          <Button
            onClick={handleGenerateComments}
            disabled={isGeneratingComments || isMissionOver}
            className="mt-4 w-full" // 스타일 조정
          >
            {isGeneratingComments ? '댓글 생성 중...' : '임시 댓글 요청'}
          </Button>
          <button
            onClick={toggleMonologueVisibility}
            style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 10 }}
          >
            {isMonologueVisible ? '독백 숨기기' : '독백 보이기'}
          </button>
        </div>

        <div ref={mainContentAreaRef} className={styles.mainContentArea}>
          <div className={styles.siteHeader}>acinside.com 갤러리</div>
          <h2 className={styles.header}>연예인 갤러리</h2>
          {/* 기사 제목 (missionData에서 가져옴) */}
          <div className={styles.articleTitle}>{missionData.articleTitle ?? '기사 제목 없음'}</div>
          {/* 작성자 정보 및 시간 (missionData의 articleCreatedAt 사용) */}
          <div className={styles.articleMeta}>
            <span>ㅇㅇ(118.235)</span> | <span>{missionData.articleCreatedAt ? new Date(missionData.articleCreatedAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '시간 정보 없음'}</span>
          </div>

          {/* 기사 내용 (missionData에서 가져옴) */}
          <ArticleContent
            content={missionData.articleContent} // content prop은 이미 존재
            imageFilename={missionData.articleImage} // imageFilename prop 추가 필요
            // attachmentFilename prop 전달 제거
          />

          {/* 기사 반응 섹션 추가 */}
          <ArticleReactions
            likes={articleLikes}
            dislikes={articleDislikes}
            onLike={handleLikeArticle}
            onDislike={handleDislikeArticle}
          />

          <div className={styles.commentListSection}>
            <div className={styles.commentListHeader}>
              <div className={styles.commentCount}>
                전체 댓글 <span className={styles.countNumber}>{comments.length}</span>개
              </div>
              <div className={styles.headerControls}>
                <select className={styles.sortDropdown} value={sortOrder} onChange={handleSortChange}>
                  <option value="등록순">등록순</option>
                  <option value="최신순">최신순</option>
                  <option value="답글순">답글순</option>
                </select>
                <span className={styles.listControls}>
                  <button onClick={scrollToTop} className={styles.controlButton}>본문 보기</button> |
                  <button onClick={toggleCommentList} className={styles.controlButton}>
                    댓글{isCommentListVisible ? '닫기 ▼' : '열기 ▲'}
                  </button> |
                  <button onClick={refreshComments} className={styles.controlButton}>새로고침</button>
                </span>
              </div>
            </div>
            {/* onReplySubmit 핸들러 전달 */}
            <CommentList
              comments={comments}
              isVisible={isCommentListVisible}
              onReplySubmit={handleReplySubmit} // 핸들러 전달
            />
            {isCommentListVisible && comments.length > 0 && (
              <div className={styles.commentListFooter}>
                <span className={styles.listControls}>
                  <button onClick={scrollToTop} className={styles.controlButton}>본문 보기</button> |
                  <button onClick={toggleCommentList} className={styles.controlButton}>
                    댓글{isCommentListVisible ? '닫기 ▼' : '열기 ▲'}
                  </button> |
                  <button onClick={refreshComments} className={styles.controlButton}>새로고침</button>
                </span>
              </div>
            )}
          </div>

          <div className={styles.commentInputSection}>
            <CommentInput onSubmit={handleCommentSubmit} disabled={isMissionOver || attemptsLeft <= 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentScene;
