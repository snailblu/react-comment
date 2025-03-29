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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // 모델 이름 확인

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

interface ParsedAiResponse {
  generatedComments: Comment[];
  predictedReactions: ArticleReactionsType | null;
  error?: string; // 파싱 또는 API 오류 메시지
}

// AI 응답 텍스트를 파싱하여 댓글과 예측 반응으로 분리하는 함수
const parseAiResponse = (responseText: string): Omit<ParsedAiResponse, 'error'> => {
  let commentTextPart = responseText;
  let predictedReactions: ArticleReactionsType | null = null;

  // 응답 마지막 줄이 JSON 형식인지 확인하고 분리 시도
  const lines = responseText.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  if (lastLine.startsWith('{') && lastLine.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(lastLine);
      if (typeof parsedJson.likes === 'number' && typeof parsedJson.dislikes === 'number') {
        predictedReactions = parsedJson;
        commentTextPart = lines.slice(0, -1).join('\n');
        console.log("Parsed predicted reactions:", predictedReactions);
      } else {
        console.warn("Last line looks like JSON but doesn't match ArticleReactions format:", lastLine);
      }
    } catch (e) {
      console.warn("Failed to parse last line as JSON, treating as comment:", lastLine, e);
    }
  }

  // 댓글 파싱
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
        parentId = complexReplyMatch[3].trim();
        content = complexReplyMatch[4].trim();
    } else if (simpleReplyMatch) {
        isReply = true;
        parentId = simpleReplyMatch[1].trim();
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

  return { generatedComments, predictedReactions };
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
): Promise<ParsedAiResponse> => {
  if (!API_KEY) {
    return { generatedComments: [], predictedReactions: null, error: "Gemini API 키가 설정되지 않았습니다." };
  }
  if (!missionData) {
    return { generatedComments: [], predictedReactions: null, error: "미션 데이터가 없습니다." };
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
        return { generatedComments: [], predictedReactions: null, error: `Gemini API 요청이 안전 설정에 의해 차단되었습니다: ${blockReason}` };
      } else {
        console.error("Gemini API returned an empty response without a specific block reason.");
        return { generatedComments: [], predictedReactions: null, error: "Gemini API로부터 빈 응답을 받았습니다." };
      }
    }

    // 응답 파싱
    const { generatedComments, predictedReactions } = parseAiResponse(generatedText);

    if (generatedComments.length === 0 && !predictedReactions) {
        return { generatedComments: [], predictedReactions: null, error: "AI가 댓글이나 추천/비추천 예측을 생성하지 못했습니다." };
    }

    return { generatedComments, predictedReactions };

  } catch (error) {
    console.error('Failed to generate AI comments via service:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI 처리 중 알 수 없는 오류가 발생했습니다.';
    return { generatedComments: [], predictedReactions: null, error: `AI 처리 중 오류 발생: ${errorMessage}` };
  }
};
