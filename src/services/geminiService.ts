// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from "@google/generative-ai"; // 서버리스 함수로 이동
// import { v4 as uuidv4 } from 'uuid'; // uuidv4 제거
// import { generateCommentPrompt } from '../lib/promptGenerator'; // 서버리스 함수로 이동
import {
  Comment,
  ArticleReactions as ArticleReactionsType,
  Mission,
} from "../types";

// --- AI 응답 파싱 및 처리 로직 (서버리스 함수에서 처리하므로 클라이언트에서는 제거 또는 단순화 가능) ---
// 서버리스 함수가 파싱된 결과를 반환하므로, 클라이언트 측 파싱 로직은 필요 없어짐.
// 서버 응답 타입을 정의합니다.

// 예측된 '추가' 반응 타입 정의 (서버 응답과 동일하게 유지)
interface PredictedAddedReactions {
  added_likes: number;
  added_dislikes: number;
}

// ParsedAiResponse 인터페이스 export 추가
export interface ParsedAiResponse {
  generatedComments: Comment[];
  predictedAddedReactions: PredictedAddedReactions | null; // 타입 변경
  error?: string; // API 호출 또는 서버 오류 메시지
}

// 클라이언트 측에서는 파싱 로직이 필요 없으므로 parseAiResponse 함수 제거

// --- Vercel Serverless Function 호출 함수 ---

/**
 * Vercel Serverless Function을 호출하여 AI 댓글 및 반응 예측을 생성합니다.
 * @param missionData 현재 미션 데이터
 * @param currentComments 현재 댓글 목록
 * @param currentReactions 현재 기사 반응 (좋아요/싫어요)
 * @returns 서버로부터 받은 AI 응답 (댓글 목록, 예측 반응) 또는 오류 메시지
 */
export const generateAiComments = async (
  missionData: Mission,
  currentComments: Comment[],
  currentReactions: ArticleReactionsType
): Promise<ParsedAiResponse> => {
  // 클라이언트 측에서는 API 키 체크 불필요
  if (!missionData) {
    // 간단한 입력값 검증은 유지 가능
    return {
      generatedComments: [],
      predictedAddedReactions: null,
      error: "미션 데이터가 없습니다.",
    };
  }

  try {
    console.log(
      `Requesting AI comments via serverless function for article: ${missionData.articleTitle}`
    );

    // Use relative path for API calls, works for both dev and prod
    const apiUrl = "/api/generate-comments";

    // Vercel Serverless Function 엔드포인트 호출
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        missionData,
        currentComments,
        currentReactions,
      }),
    });

    // 응답 상태 코드 확인
    if (!response.ok) {
      // 서버에서 오류 응답을 보낸 경우
      const errorData = await response.json().catch(() => ({
        error: "Failed to parse error response from server.",
      })); // 오류 응답 파싱 실패 대비
      console.error(
        `Serverless function error: ${response.status} ${response.statusText}`,
        errorData
      );
      return {
        generatedComments: [],
        predictedAddedReactions: null,
        error: `서버 오류 (${response.status}): ${
          errorData?.error || response.statusText
        }`,
      };
    }

    // 성공 응답 처리
    const data: ParsedAiResponse = await response.json();
    console.log("Received response from serverless function:", data);

    // 서버 응답에 오류 필드가 있는지 확인 (선택적)
    if (data.error) {
      console.error(
        "Serverless function returned an error in the response body:",
        data.error
      );
      return {
        generatedComments: [],
        predictedAddedReactions: null,
        error: data.error,
      };
    }

    // 성공적인 데이터 반환
    return data;
  } catch (error) {
    // 네트워크 오류 등 fetch 자체의 오류 처리
    console.error("Failed to call serverless function:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "클라이언트 측에서 서버리스 함수 호출 중 알 수 없는 오류가 발생했습니다.";
    return {
      generatedComments: [],
      predictedAddedReactions: null,
      error: `네트워크 또는 클라이언트 오류: ${errorMessage}`,
    };
  }
};
