import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import { generateCommentPrompt } from '../lib/promptGenerator';
import { Comment, ArticleReactions as ArticleReactionsType, Mission } from '../types';

// --- Gemini API 설정 ---
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Gemini API Key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
  // API 키가 없을 경우, 실제 API 호출을 시도하기 전에 오류를 발생시키거나
  // 더 명확한 처리가 필요할 수 있습니다. 여기서는 콘솔 에러만 출력합니다.
}
// API 키가 없어도 genAI 객체는 생성하되, 실제 호출 시점에 키 유무를 다시 확인하는 것이 좋습니다.
const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // 모델 이름 확인

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// --- AI 응답 파싱 및 처리 로직 ---

// 예측된 '추가' 반응 타입 정의
interface PredictedAddedReactions {
  added_likes: number;
  added_dislikes: number;
}

// ParsedAiResponse 인터페이스 export 추가
export interface ParsedAiResponse {
  generatedComments: Comment[];
  predictedAddedReactions: PredictedAddedReactions | null; // 타입 변경
  error?: string; // 파싱 또는 API 오류 메시지
}

// AI 응답 텍스트를 파싱하여 댓글과 예측 반응으로 분리하는 함수
const parseAiResponse = (responseText: string): Omit<ParsedAiResponse, 'error'> => {
  let commentTextPart = responseText;
  let predictedAddedReactions: PredictedAddedReactions | null = null; // 변수명 및 타입 변경

  // 응답 마지막 줄이 JSON 형식인지 확인하고 분리 시도
  const lines = responseText.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  if (lastLine.startsWith('{') && lastLine.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(lastLine);
      // 필드명 변경: added_likes, added_dislikes 확인
      if (typeof parsedJson.added_likes === 'number' && typeof parsedJson.added_dislikes === 'number') {
        predictedAddedReactions = parsedJson; // 변수명 변경
        commentTextPart = lines.slice(0, -1).join('\n');
        console.log("Parsed predicted added reactions:", predictedAddedReactions); // 로그 메시지 변경
      } else {
        console.warn("Last line looks like JSON but doesn't match PredictedAddedReactions format:", lastLine); // 경고 메시지 변경
      }
    } catch (e) {
      console.warn("Failed to parse last line as JSON, treating as comment:", lastLine, e); // 경고 메시지 유지
    }
  }

  // 댓글 파싱 (기존 로직 유지)
  const commentLines = commentTextPart.split('\n').map(c => c.trim()).filter(c => c.length > 0);
  const generatedComments: Comment[] = [];

  commentLines.forEach((line) => {
    let isReply = false;
    let parentId: string | undefined = undefined;
    let nickname: string | undefined = undefined;
    let ip: string | undefined = undefined;
    let content: string | undefined = undefined;

    // 파싱 로직 (CommentScene에서 가져옴)
    const complexReplyMatch = line.match(/^(.+?)\((.*?)\):\s*->\s*\[(.*?)\]\s*(.*)$/);
    const simpleReplyMatch = line.match(/^->\s*\[(.*?)\]\s*(.+?)\((.*?)\):\s*(.*)$/);
    const regularCommentMatch = line.match(/^(.+?)\((.*?)\):\s*(.*)$/);

    if (complexReplyMatch) {
        isReply = true;
        nickname = complexReplyMatch[1].trim();
        ip = complexReplyMatch[2].trim();
        // ID: 접두사 제거
        parentId = complexReplyMatch[3].trim().replace(/^ID:\s*/, '');
        content = complexReplyMatch[4].trim();
    } else if (simpleReplyMatch) {
        isReply = true;
        // ID: 접두사 제거
        parentId = simpleReplyMatch[1].trim().replace(/^ID:\s*/, '');
        nickname = simpleReplyMatch[2].trim();
        ip = simpleReplyMatch[3].trim();
        content = simpleReplyMatch[4].trim();
    } else if (regularCommentMatch) {
        isReply = false;
        parentId = undefined;
        nickname = regularCommentMatch[1].trim();
        ip = regularCommentMatch[2].trim();
        content = regularCommentMatch[3].trim();
    }

    if (content !== undefined) {
        // 추가: 댓글 끝의 (UUID) 패턴 제거
        content = content.replace(/\s\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\)$/, '').trim();

        generatedComments.push({
            id: uuidv4(),
            nickname: nickname || '익명AI',
            ip: ip || '0.0.0',
            content: content,
            likes: Math.floor(Math.random() * 10), // 임의 좋아요 수 (필요시 조정)
            is_player: false,
            isReply: isReply,
            parentId: parentId,
            created_at: new Date().toISOString(),
        });
    } else {
        console.warn(`AI comment format mismatch, using full text as content: "${line}"`);
        generatedComments.push({
            id: uuidv4(),
            nickname: '익명AI',
            ip: '0.0.0',
            content: line,
            likes: Math.floor(Math.random() * 5),
            is_player: false,
            isReply: false,
            parentId: undefined,
            created_at: new Date().toISOString(),
        });
    }
  });

  return { generatedComments, predictedAddedReactions }; // 반환값 변경
};


// --- Gemini API 호출 함수 ---

/**
 * Gemini API를 호출하여 AI 댓글 및 반응 예측을 생성합니다.
 * @param missionData 현재 미션 데이터
 * @param currentComments 현재 댓글 목록
 * @param currentReactions 현재 기사 반응 (좋아요/싫어요)
 * @returns 파싱된 AI 응답 (댓글 목록, 예측 반응) 또는 오류 메시지
 */
export const generateAiComments = async (
  missionData: Mission,
  currentComments: Comment[],
  currentReactions: ArticleReactionsType
): Promise<ParsedAiResponse> => { // 반환 타입은 ParsedAiResponse 유지 (내부 필드만 변경됨)
  if (!API_KEY) {
    return { generatedComments: [], predictedAddedReactions: null, error: "Gemini API 키가 설정되지 않았습니다." }; // 반환값 변경
  }
  if (!missionData) {
    return { generatedComments: [], predictedAddedReactions: null, error: "미션 데이터가 없습니다." }; // 반환값 변경
  }

  try {
    console.log(`Requesting AI comments for article: ${missionData.articleTitle}`);
    const prompt = generateCommentPrompt(
      missionData.articleTitle ?? '제목 없음',
      missionData.articleContent ?? '내용 없음',
      currentComments,
      currentReactions
    );
    console.log("Generated Prompt for Gemini:", prompt);

    const result: GenerateContentResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    console.log("Full Gemini Response:", JSON.stringify(response, null, 2));

    const generatedText = response.text();

    if (!generatedText) {
      if (response.promptFeedback?.blockReason) {
        const blockReason = response.promptFeedback.blockReason;
        console.error("Gemini request blocked due to safety settings:", blockReason, response.promptFeedback.safetyRatings);
        return { generatedComments: [], predictedAddedReactions: null, error: `Gemini API 요청이 안전 설정에 의해 차단되었습니다: ${blockReason}` }; // 반환값 변경
      } else {
        console.error("Gemini API returned an empty response without a specific block reason.");
        return { generatedComments: [], predictedAddedReactions: null, error: "Gemini API로부터 빈 응답을 받았습니다." }; // 반환값 변경
      }
    }

    // 응답 파싱
    const { generatedComments, predictedAddedReactions } = parseAiResponse(generatedText); // 변수명 변경

    if (generatedComments.length === 0 && !predictedAddedReactions) { // 조건 변경
        return { generatedComments: [], predictedAddedReactions: null, error: "AI가 댓글이나 추천/비추천 예측을 생성하지 못했습니다." }; // 반환값 변경
    }

    return { generatedComments, predictedAddedReactions }; // 반환값 변경

  } catch (error) {
    console.error('Failed to generate AI comments via service:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI 처리 중 알 수 없는 오류가 발생했습니다.';
    return { generatedComments: [], predictedAddedReactions: null, error: `AI 처리 중 오류 발생: ${errorMessage}` }; // 반환값 변경
  }
};
