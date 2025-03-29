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
import { v4 as uuidv4 } from 'uuid'; // uuid 라이브러리 import
import { generateCommentPrompt } from '../lib/promptGenerator'; // 프롬프트 생성 함수 import
import { Comment, Opinion, ArticleReactions as ArticleReactionsType } from '../types'; // ArticleReactions 타입 import 추가 및 별칭 사용

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

      // 현재 기사 추천/비추천 수를 객체로 전달
      const currentReactions: ArticleReactionsType = {
        likes: articleLikes,
        dislikes: articleDislikes,
      };

      // 분리된 함수를 사용하여 프롬프트 생성 (reactions 인자 추가)
      const prompt = generateCommentPrompt(
        missionData.articleTitle ?? '제목 없음',
        missionData.articleContent ?? '내용 없음',
        comments, // 현재 댓글 목록 상태 전달
        currentReactions // 현재 추천/비추천 수 전달
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

      // --- AI 응답 처리: 댓글과 추천/비추천 분리 ---
      let commentTextPart = generatedText;
      let predictedReactions: ArticleReactionsType | null = null;

      // 응답 마지막 줄이 JSON 형식인지 확인하고 분리 시도
      const lines = generatedText.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine.startsWith('{') && lastLine.endsWith('}')) {
        try {
          const parsedJson = JSON.parse(lastLine);
          // 파싱된 객체가 likes와 dislikes 속성을 숫자로 가지고 있는지 확인
          if (typeof parsedJson.likes === 'number' && typeof parsedJson.dislikes === 'number') {
            predictedReactions = parsedJson;
            // 댓글 부분만 추출 (마지막 줄 제외)
            commentTextPart = lines.slice(0, -1).join('\n');
            console.log("Parsed predicted reactions:", predictedReactions);
          } else {
            console.warn("Last line looks like JSON but doesn't match ArticleReactions format:", lastLine);
          }
        } catch (e) {
          console.warn("Failed to parse last line as JSON, treating as comment:", lastLine, e);
        }
      }

      // --- 댓글 파싱 ---
      // commentTextPart를 사용하여 댓글 파싱
      const commentLines = commentTextPart.split('\n').map(c => c.trim()).filter(c => c.length > 0);
      const generatedComments: Comment[] = [];

      commentLines.forEach((line, index) => {
        let isReply = false;
        let parentId: string | undefined = undefined;
        let nickname: string | undefined = undefined;
        let ip: string | undefined = undefined;
        let content: string | undefined = undefined;

        // 파싱 순서 변경: 더 구체적인 대댓글 형식을 먼저 확인
        // 1. "작성자(IP): -> [ID] 내용" 형식 (가장 복잡)
        const complexReplyMatch = line.match(/^(.+?)\((.*?)\):\s*->\s*\[(.*?)\]\s*(.*)$/);
        // 2. "-> [ID] 작성자(IP): 내용" 형식 (단순 대댓글)
        const simpleReplyMatch = line.match(/^->\s*\[(.*?)\]\s*(.+?)\((.*?)\):\s*(.*)$/);
        // 3. "작성자(IP): 내용" 형식 (일반 댓글)
        const regularCommentMatch = line.match(/^(.+?)\((.*?)\):\s*(.*)$/);

        if (complexReplyMatch) {
            // 형식: "밤의황제(29.30.31.32): -> [ai-1743209007495-2] 니얼굴빻빻(222.111): 맞는말인데 왜 비추?"
            // 이 경우, 실제 대댓글 작성자는 내용 부분에 포함될 수 있음.
            // 여기서는 첫번째 작성자/IP를 댓글 작성자로 간주하고, 나머지를 내용으로 처리.
            isReply = true;
            nickname = complexReplyMatch[1].trim();
            ip = complexReplyMatch[2].trim();
            parentId = complexReplyMatch[3].trim();
            content = complexReplyMatch[4].trim(); // 내용 부분 전체
            console.log(`Parsed complex reply: Nick=${nickname}, IP=${ip}, ParentID=${parentId}, Content=${content}`);
        } else if (simpleReplyMatch) {
            // 형식: "-> [tut-1] 니얼굴빻빻(222.111): 꼬우면 보지마셈;"
            isReply = true;
            parentId = simpleReplyMatch[1].trim();
            nickname = simpleReplyMatch[2].trim();
            ip = simpleReplyMatch[3].trim();
            content = simpleReplyMatch[4].trim();
            console.log(`Parsed simple reply: Nick=${nickname}, IP=${ip}, ParentID=${parentId}, Content=${content}`);
        } else if (regularCommentMatch) {
            // 형식: "뉴비응원단(1.2.3.4): 도림이 응원글 보고 힘내서 왔다!"
            isReply = false; // 일반 댓글
            parentId = undefined;
            nickname = regularCommentMatch[1].trim();
            ip = regularCommentMatch[2].trim();
            content = regularCommentMatch[3].trim();
            console.log(`Parsed regular comment: Nick=${nickname}, IP=${ip}, Content=${content}`);
        }

        // 파싱 성공 여부 확인 (content가 정의되었는지)
        if (content !== undefined) { // content가 undefined가 아니면 파싱 성공으로 간주
            generatedComments.push({
                id: uuidv4(), // UUID로 ID 생성
                nickname: nickname || '익명AI', // 파싱 실패 시 기본값
                ip: ip || '0.0.0', // 파싱 실패 시 기본값
                content: content,
                likes: Math.floor(Math.random() * 10),
                is_player: false,
                isReply: isReply,
                parentId: parentId,
                created_at: new Date().toISOString(),
            });
        } else {
            // 어떤 형식에도 맞지 않는 경우 (Fallback)
            console.warn(`AI comment format mismatch, using full text as content: "${line}"`);
            generatedComments.push({
                id: uuidv4(), // UUID로 ID 생성
                nickname: '익명AI',
                ip: '0.0.0',
                content: line, // 원본 라인 전체를 내용으로 사용
                likes: Math.floor(Math.random() * 5),
                is_player: false,
                isReply: false, // 파싱 불가 시 일반 댓글로 처리
                parentId: undefined,
                created_at: new Date().toISOString(),
            });
        }
      });

      // --- 상태 업데이트 ---
      if (generatedComments.length === 0 && !predictedReactions) {
        setMonologue('AI가 댓글이나 추천/비추천 예측을 생성하지 못했습니다. 다시 시도해주세요.');
      } else {
        // 1. 댓글 상태 업데이트 (부모 ID 유효성 검사 추가)
        if (generatedComments.length > 0) {
          setComments((prevComments) => {
            let newCommentsList = [...prevComments]; // 시작은 이전 댓글 목록 복사
            // let newCommentsList = [...prevComments]; // 중복 선언 제거
            const tempGeneratedComments: Comment[] = []; // 이번 배치에서 생성된 댓글 임시 저장

            generatedComments.forEach(newComment => {
              if (newComment.isReply && newComment.parentId) {
                const targetIdentifier = newComment.parentId; // AI가 제공한 부모 식별자 (ID 또는 닉네임)
                let actualParentId: string | undefined = undefined;
                let parentComment: Comment | undefined = undefined;

                // 1. 기존 댓글 + 현재 배치에서 ID로 부모 찾기
                parentComment = [...newCommentsList, ...tempGeneratedComments].find(c => c.id === targetIdentifier);

                // 2. ID로 못 찾으면, 기존 댓글 + 현재 배치에서 닉네임으로 부모 찾기
                if (!parentComment) {
                  parentComment = [...newCommentsList, ...tempGeneratedComments].find(c => c.nickname === targetIdentifier);
                }

                if (parentComment) {
                  actualParentId = parentComment.id; // 실제 부모 ID 확보
                  newComment.parentId = actualParentId; // newComment의 parentId를 실제 ID로 업데이트

                  // 부모 댓글 위치 찾기 (newCommentsList 기준)
                  const parentIndex = newCommentsList.findIndex(comment => comment.id === actualParentId);

                  if (parentIndex !== -1) {
                    // 부모 댓글 찾음: 삽입 위치 계산
                    let insertionIndex = parentIndex + 1;
                    while (insertionIndex < newCommentsList.length &&
                           newCommentsList[insertionIndex].isReply &&
                           newCommentsList[insertionIndex].parentId === actualParentId) { // 같은 부모를 가진 대댓글 뒤에 삽입
                      insertionIndex++;
                    }
                    newCommentsList.splice(insertionIndex, 0, newComment);
                  } else {
                    // newCommentsList에 부모가 없는 경우 (tempGeneratedComments에만 있는 경우) -> 일단 temp에 넣고 나중에 처리
                    tempGeneratedComments.push(newComment);
                  }
                } else {
                  // ID로도, 닉네임으로도 부모 못 찾음: 경고 로그 남기고 일반 댓글처럼 처리 준비
                  console.warn(`Parent comment target "${targetIdentifier}" provided by AI does not match any existing ID or Nickname. Appending reply as a regular comment.`);
                  // isReply는 유지하되, parentId는 undefined로 설정하여 일반 댓글처럼 추가되도록 함
                  newComment.parentId = undefined;
                  tempGeneratedComments.push(newComment); // 일반 댓글처럼 추가될 예정
                }
              } else {
                // 일반 댓글 처리
                tempGeneratedComments.push(newComment); // 일단 temp에 추가
              }
            });

            // tempGeneratedComments에 있는 댓글들을 newCommentsList에 최종 추가
            // (대댓글 삽입이 위에서 처리되었으므로, 여기서는 주로 일반 댓글과 부모 못 찾은 대댓글이 추가됨)
            newCommentsList.push(...tempGeneratedComments.filter(tc => !newCommentsList.some(nc => nc.id === tc.id))); // 중복 추가 방지

            return newCommentsList; // 최종적으로 정렬된 새 배열 반환
          });
          setMonologue(`AI가 ${generatedComments.length}개의 댓글(대댓글 포함)을 생성했습니다.`);
        } else {
          setMonologue('AI가 새 댓글은 생성하지 않았습니다.'); // 댓글만 없을 경우 메시지
        }

        // 2. 추천/비추천 상태 업데이트 (예측값이 있으면)
        if (predictedReactions) {
          setArticleLikes(predictedReactions.likes);
           setArticleDislikes(predictedReactions.dislikes);
           // 독백에 추천/비추천 업데이트 정보 추가 (null 체크 추가)
           setMonologue(prev => {
             const reactionText = predictedReactions
               ? ` (예상 추천/비추천: ${predictedReactions.likes}/${predictedReactions.dislikes})`
               : '';
             return `${prev}${reactionText}`;
           });
         }
       }

      // 여론 상태 업데이트 로직은 여전히 제거된 상태 유지


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
      id: uuidv4(), // UUID로 ID 생성
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
      id: uuidv4(), // UUID로 ID 생성
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
