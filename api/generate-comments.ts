import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateCommentPrompt } from '../src/lib/promptGenerator';
import { Comment, ArticleReactions as ArticleReactionsType, Mission } from '../src/types';
import dotenv from 'dotenv'; // dotenv import
import path from 'path'; // path 모듈 import

// .env.local 파일 경로 명시적 지정 (프로젝트 루트 기준) - 모든 import 이후에 실행
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });


// --- Gemini API 설정 (Server-side) ---
const API_KEY = process.env.GEMINI_API_KEY; // Vercel 환경 변수 사용 (dotenv 로드 후)

// API 키 유효성 검사
if (!API_KEY) {
  console.error("Gemini API Key not found in server environment variables.");
  // 실제 운영 환경에서는 여기서 에러를 던지거나 기본 응답을 반환해야 할 수 있습니다.
}

const genAI = new GoogleGenerativeAI(API_KEY || ""); // 키가 없어도 객체는 생성
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // 모델 이름 확인 (gemini-1.5-flash 사용 권장)

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

// --- AI 응답 파싱 및 처리 로직 (기존 geminiService.ts에서 가져옴) ---
interface PredictedAddedReactions {
  added_likes: number;
  added_dislikes: number;
}

export interface ParsedAiResponse {
  generatedComments: Comment[];
  predictedAddedReactions: PredictedAddedReactions | null;
  error?: string;
}

const parseAiResponse = (responseText: string): Omit<ParsedAiResponse, 'error'> => {
    let commentTextPart = responseText;
    let predictedAddedReactions: PredictedAddedReactions | null = null;

    const lines = responseText.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.startsWith('{') && lastLine.endsWith('}')) {
        try {
            const parsedJson = JSON.parse(lastLine);
            if (typeof parsedJson.added_likes === 'number' && typeof parsedJson.added_dislikes === 'number') {
                predictedAddedReactions = parsedJson;
                commentTextPart = lines.slice(0, -1).join('\n');
                console.log("Parsed predicted added reactions:", predictedAddedReactions);
            } else {
                console.warn("Last line looks like JSON but doesn't match PredictedAddedReactions format:", lastLine);
            }
        } catch (e) {
            console.warn("Failed to parse last line as JSON, treating as comment:", lastLine, e);
        }
    }

    const commentLines = commentTextPart.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    const generatedComments: Comment[] = [];

    commentLines.forEach((line) => {
        let isReply = false;
        let parentId: string | undefined = undefined;
        let nickname: string | undefined = undefined;
        let ip: string | undefined = undefined;
        let content: string | undefined = undefined;

        const complexReplyMatch = line.match(/^(.+?)\((.*?)\):\s*->\s*\[(.*?)\]\s*(.*)$/);
        const simpleReplyMatch = line.match(/^->\s*\[(.*?)\]\s*(.+?)\((.*?)\):\s*(.*)$/);
        const regularCommentMatch = line.match(/^(.+?)\((.*?)\):\s*(.*)$/);

        if (complexReplyMatch) {
            isReply = true;
            nickname = complexReplyMatch[1].trim();
            ip = complexReplyMatch[2].trim();
            parentId = complexReplyMatch[3].trim().replace(/^ID:\s*/, '');
            content = complexReplyMatch[4].trim();
        } else if (simpleReplyMatch) {
            isReply = true;
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
            content = content.replace(/\s\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\)$/, '').trim();

            generatedComments.push({
                id: uuidv4(),
                nickname: nickname || '익명AI',
                ip: ip || '0.0.0', // IP 주소는 서버에서 생성하므로 클라이언트에서 받은 값 대신 고정값 사용 가능
                content: content,
                likes: Math.floor(Math.random() * 10),
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

    return { generatedComments, predictedAddedReactions };
};


// --- Vercel Serverless Function Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 디버깅 로그: 함수 시작 시 환경 변수 값 확인
  console.log('Serverless Function - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Exists' : 'Not Found');

  // API 키 존재 여부 재확인 (함수 시작 시)
  const API_KEY = process.env.GEMINI_API_KEY; // 여기서 다시 한번 변수에 할당
  if (!API_KEY) {
    console.error("Gemini API Key check failed inside handler."); // 추가 로그
    return res.status(500).json({ error: "Gemini API Key not configured on the server." });
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 요청 본문에서 데이터 추출
    const { missionData, currentComments, currentReactions } = req.body as {
      missionData: Mission;
      currentComments: Comment[];
      currentReactions: ArticleReactionsType;
    };

    // 필수 데이터 유효성 검사
    if (!missionData || !currentComments || !currentReactions) {
      return res.status(400).json({ error: "Missing required data in request body (missionData, currentComments, currentReactions)." });
    }

    console.log(`Received request for AI comments for article: ${missionData.articleTitle}`);

    // 프롬프트 생성
    const prompt = generateCommentPrompt(
      missionData.articleTitle ?? '제목 없음',
      missionData.articleContent ?? '내용 없음',
      currentComments,
      currentReactions
    );
    console.log("Generated Prompt for Gemini:", "[Prompt hidden for brevity in server logs]"); // 실제 프롬프트 로깅은 보안상 주의

    // Gemini API 호출
    const result: GenerateContentResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    console.log("Full Gemini Response:", "[Response hidden for brevity in server logs]"); // 실제 응답 로깅 주의

    const generatedText = response.text();

    // 응답 처리
    if (!generatedText) {
      if (response.promptFeedback?.blockReason) {
        const blockReason = response.promptFeedback.blockReason;
        console.error("Gemini request blocked due to safety settings:", blockReason, response.promptFeedback.safetyRatings);
        // 클라이언트에게 좀 더 일반적인 오류 메시지를 반환할 수 있음
        return res.status(500).json({ error: `Gemini API request blocked due to safety settings: ${blockReason}` });
      } else {
        console.error("Gemini API returned an empty response without a specific block reason.");
        return res.status(500).json({ error: "Gemini API returned an empty response." });
      }
    }

    // 응답 파싱
    const parsedResponse = parseAiResponse(generatedText);

    // 파싱 결과 확인
    if (parsedResponse.generatedComments.length === 0 && !parsedResponse.predictedAddedReactions) {
        console.warn("AI did not generate comments or predictions.");
        // 빈 결과라도 성공으로 처리할지, 오류로 처리할지 결정 필요
        // 여기서는 빈 결과를 성공으로 반환
    }

    // 성공 응답 반환
    return res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('Error in Vercel function processing AI comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred processing AI comments.';
    // 클라이언트에게는 상세 오류 대신 일반적인 메시지 반환 권장
    return res.status(500).json({ error: `Internal server error: ${errorMessage}` });
  }
}
