import React, { useState, useEffect, useRef } from 'react'; // useRef import 추가
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card"; // 경로 수정
import { Button } from "./ui/button"; // 경로 수정
import { Skeleton } from "./ui/skeleton"; // 경로 수정
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Gemini SDK import
import { Comment } from '../types'; // Comment 타입 import 추가

// Gemini API 설정 (CommentScene과 동일하게)
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Gemini API Key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
}
const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // 모델 확인

const generationConfig = {
  temperature: 0.9, // 피드백 생성이므로 약간 낮출 수 있음 (예: 0.7)
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // 피드백 길이에 맞게 조정 가능
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];


interface Feedback {
  npc_name: string;
  message: string;
}

const ResultScene: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // location.state 타입 정의 확장 (playerComments 대신 allComments 사용)
  interface LocationState {
    missionId?: number;
    success?: boolean;
    allComments?: Comment[]; // 전체 댓글 배열 추가
    missionTitle?: string; // 미션 제목 추가
  }
  const { missionId, success: isSuccess = false, allComments = [], missionTitle = "알 수 없는 미션" } = (location.state as LocationState) || {}; // missionTitle 추가 및 기본값 설정

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEnding, setIsCheckingEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCalledRef = useRef(false); // API 호출 플래그 Ref 추가

  // isLastMission을 컴포넌트 레벨에서 정의
  const isLastMission = missionId === 3; // 예시: missionId가 3이면 마지막 미션이라고 가정

  useEffect(() => {
    const fetchFeedback = async () => {
      // 성공했을 때만 피드백을 가져옵니다.
      if (!isSuccess) {
        setIsLoading(false);
        return; // 실패 시 피드백 로드 안 함
      }

      setIsLoading(true);
      setError(null);
      if (!API_KEY) {
        setError('Gemini API 키가 설정되지 않았습니다.');
        setIsLoading(false);
        return;
      }

      try {
        // 전체 댓글 목록을 프롬프트용 문자열로 변환
        const allCommentsText = allComments.length > 0
          ? allComments.map((comment: Comment, index: number) => { // 타입 명시 추가
              const prefix = comment.is_player ? "(플레이어) " : "";
              const replyIndicator = comment.isReply && comment.parentId ? ` -> [${comment.parentId.substring(0, 6)}...] ` : ""; // 대댓글 표시 및 부모 ID 축약
              // comment.ip가 없을 경우 기본값 제공
              return `${index + 1}. ${prefix}${comment.nickname || '익명'}(${comment.ip || '?.?.?.?'})${replyIndicator}: ${comment.content}`;
            }).join('\n')
          : "댓글이 없습니다.";

        // 피드백 생성용 프롬프트 수정 (missionId 대신 missionTitle 사용)
        const prompt = `
당신은 게임 속 NPC 'X'입니다. 플레이어는 방금 미션 '${missionTitle}'을 성공적으로 완료했습니다.
다음은 해당 미션의 전체 댓글 타임라인입니다. (플레이어) 라고 표시된 댓글이 플레이어가 작성한 것입니다.

--- 전체 댓글 타임라인 시작 ---
${allCommentsText}
--- 전체 댓글 타임라인 끝 ---

플레이어의 성공적인 여론 조작에 대해 칭찬하는 짧고 임팩트 있는 피드백 메시지를 한국어로 작성해주세요.
전체 댓글 타임라인의 맥락을 고려하여, **플레이어의 어떤 댓글(들)이 여론의 흐름을 바꾸는 데 결정적인 역할**을 했는지 분석하고 구체적으로 칭찬해주세요. (예: "초반 부정적 여론 속에서 플레이어의 '(플레이어) 댓글 내용' 댓글이 분위기를 반전시키는 데 핵심적이었군.")
결과는 "NPC_NAME: MESSAGE" 형식으로 출력해주세요. NPC_NAME은 'X'로 고정합니다.

미션 제목: ${missionTitle}
미션 결과: 성공
`;

        console.log('ResultScene: Generating feedback using Gemini API...');
        console.log('Prompt:', prompt); // 프롬프트 로그 추가

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
          safetySettings,
        });

        const response = result.response;
        console.log("Full Gemini Response:", JSON.stringify(response, null, 2)); // 전체 응답 로그

        let generatedText = response.text();

        if (!generatedText) {
          if (response.promptFeedback?.blockReason) {
            console.error("Gemini request blocked due to safety settings:", response.promptFeedback.blockReason, response.promptFeedback.safetyRatings);
            throw new Error(`Gemini API 요청이 안전 설정에 의해 차단되었습니다: ${response.promptFeedback.blockReason}`);
          } else {
            console.error("Gemini API returned an empty response without a specific block reason.");
            throw new Error("Gemini API로부터 빈 응답을 받았습니다.");
          }
        }

        // --- 응답 텍스트 정리 ---
        // 1. 앞뒤 공백/줄바꿈 제거
        let cleanedText = generatedText.trim();
        // 2. 시작 부분의 "---" 및 관련 공백/줄바꿈 제거 (정규식 사용)
        cleanedText = cleanedText.replace(/^---\s*/, '').trim();

        // --- 정리된 텍스트로 파싱 시도 (개선: "X: " 이후 내용 추출) ---
        // "X: " 패턴을 찾아 그 이후의 내용을 메시지로 추출 (마지막 X: 기준)
        const lastIndex = cleanedText.lastIndexOf("X:");
        let feedbackMatch = null;
        if (lastIndex !== -1) {
          feedbackMatch = cleanedText.substring(lastIndex); // "X:" 부터 끝까지 추출
        }

        // 추출된 문자열에서 "X: " 제외하고 메시지만 가져오기
        if (feedbackMatch) {
          const message = feedbackMatch.substring(2).trim(); // "X:" 다음부터 끝까지 + trim
          const npcName = "X"; // NPC 이름은 고정

          const feedbackData: Feedback = { npc_name: npcName, message: message };

          // 형식 검증 (선택 사항)
          if (typeof feedbackData.npc_name !== 'string' || typeof feedbackData.message !== 'string') {
            throw new Error('수신된 피드백 데이터 형식이 올바르지 않습니다.');
          }

          setFeedback(feedbackData);
          console.log('Feedback generated and parsed:', feedbackData);
        } else {
          // "X:" 패턴을 찾지 못한 경우, 정리된 텍스트 전체를 메시지로 사용
          console.warn(`Failed to find "X: " pattern in Gemini response. Using cleaned text: "${cleanedText}"`);
          setFeedback({ npc_name: "X (파싱 실패)", message: cleanedText });
        }

      } catch (err: any) {
        console.error('Error generating feedback using Gemini API:', err);
        setError(`피드백 생성 중 오류 발생: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // StrictMode에서 두 번 실행 방지 로직 추가
    if (missionId !== undefined) {
      if (!fetchCalledRef.current) {
        fetchCalledRef.current = true; // 호출 플래그 설정
        fetchFeedback();
      }
    } else {
      setIsLoading(false);
      setError('미션 ID를 찾을 수 없습니다.');
      console.error('Mission ID not found in location state');
    }
  }, [missionId, isSuccess]); // isSuccess도 의존성 배열에 추가

  const handleProceed = async () => {
    // 컴포넌트 레벨의 isLastMission 사용
    if (isLastMission) {
      setIsCheckingEnding(true);
      setError(null);
      try {
        console.log('Checking final ending (placeholder)...');
        // TODO: 클라이언트 측 엔딩 확인 로직 구현 (게임 상태 기반)
        await new Promise(resolve => setTimeout(resolve, 500));
        // 성공/실패 및 게임 진행 상황에 따라 엔딩 타입 결정
        const mockEndingType = isSuccess ? "good" : "bad"; // 성공/실패에 따른 임시 엔딩 타입

        console.log('Ending type determined (placeholder):', mockEndingType);
        navigate('/ending', { state: { endingType: mockEndingType } });

      } catch (err: any) {
        console.error('Error checking ending (placeholder):', err);
        setError(`최종 엔딩 확인 중 오류 발생 (임시): ${err.message}`);
        setIsCheckingEnding(false);
      }
    } else {
      // 마지막 미션이 아니면 다음 에피소드로 이동
      console.log('Proceeding to next episode...');
      // TODO: 실제 다음 에피소드 ID 전달 로직 구현
      const nextMissionId = (missionId ?? 0) + 1;
      // 다음 미션으로 이동 시 isSuccess 상태는 초기화되거나 CommentScene에서 다시 결정됨
      navigate('/game', { state: { missionId: nextMissionId } }); // 다음 미션 ID 전달 (예시)
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500 p-4 text-center">{error}</p>; // 에러 메시지 스타일링 추가
    }

    if (isSuccess) {
      return (
        <>
          <CardHeader className="text-center"> {/* text-center 추가 */}
            <CardTitle className="text-2xl font-bold text-green-400">
              🎉 미션 성공 🎉
            </CardTitle>
            <CardDescription className="text-lg pt-2"> {/* text-center 제거 (CardHeader에서 처리) */}
              축하합니다! 당신은 여론 조작에 성공했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2 pt-4 pb-4"> {/* 로딩 스켈레톤 패딩 추가 */}
                <Skeleton className="h-4 w-1/4 mx-auto" /> {/* 중앙 정렬 */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" /> {/* 중앙 정렬 */}
              </div>
             ) : feedback ? (
               <div className="text-center"> {/* 피드백 텍스트 중앙 정렬 */}
                 <h3 className="font-semibold text-lg mb-1 text-gray-200">{feedback.npc_name}의 메시지:</h3> {/* 텍스트 색상 변경 */}
                 <p className="text-base italic text-gray-300">"{feedback.message}"</p> {/* 텍스트 색상 변경 */}
               </div>
             ) : (
               <p className="text-center">피드백을 기다리는 중...</p> // 피드백 로딩 전 상태
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {/* 로딩 중이 아닐 때만 버튼 표시 */}
            {!isLoading && (
                 <Button onClick={handleProceed} disabled={isCheckingEnding || isLoading}>
                 {isCheckingEnding ? '엔딩 확인 중...' : (isLastMission ? '최종 결과 보기' : '다음 에피소드로')}
               </Button>
            )}
          </CardFooter>
        </>
      );
    } else {
      // 미션 실패 시나리오
      return (
        <>
          <CardHeader className="text-center"> {/* text-center 추가 */}
            <CardTitle className="text-2xl font-bold text-red-500">
              미션 실패
            </CardTitle>
            <CardDescription className="text-lg pt-2"> {/* text-center 제거 */}
              여론 조작에 실패했습니다. 다음 기회를 노려보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 실패 시 피드백은 없거나 다른 내용 표시 가능 */}
            <p className="text-center">결과가 좋지 않습니다...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
             <Button onClick={handleProceed} disabled={isCheckingEnding}>
               {isCheckingEnding ? '엔딩 확인 중...' : (isLastMission ? '최종 결과 보기' : '다음 에피소드로')}
             </Button>
          </CardFooter>
        </>
      );
    }
  };

  return (
    // 전체 화면을 검은색 배경으로 채우고 내용을 중앙 정렬
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      {/* 카드 너비 조정 및 그림자 효과 개선 */}
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-xl shadow-blue-500/20 rounded-lg">
        {renderContent()}
      </Card>
    </div>
  );
};

export default ResultScene;
