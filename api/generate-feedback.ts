import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { generateFeedbackPrompt } from "../src/lib/promptGenerator"; // 피드백 프롬프트 생성 함수 import
import { Comment } from "../src/types"; // Comment 타입 import

// Gemini API 설정 (환경 변수 사용)
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // 모델명 확인 필요

const generationConfig = {
  temperature: 0.9, // 창의성 조절 (0.0 ~ 1.0)
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // 피드백 길이에 맞게 조절
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// 피드백 응답 파싱 함수 (간단화)
const parseFeedbackResponse = (
  responseText: string
): { npc_name: string; message: string } | null => {
  try {
    // JSON 문자열만 추출 (```json ... ``` 제거)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

    const parsed = JSON.parse(jsonString);
    if (
      parsed &&
      typeof parsed.npc_name === "string" &&
      typeof parsed.message === "string"
    ) {
      return { npc_name: parsed.npc_name, message: parsed.message };
    }
    console.warn(
      "Parsed feedback response is not in the expected format:",
      parsed
    );
    return null;
  } catch (error) {
    console.error(
      "Error parsing feedback response:",
      error,
      "Response text:",
      responseText
    );
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      articleTitle,
      articleContent,
      allComments,
      missionSuccess,
    }: {
      articleTitle: string;
      articleContent: string;
      allComments: Comment[];
      missionSuccess: boolean;
    } = req.body;

    // 입력값 검증
    if (
      !articleTitle ||
      !articleContent ||
      !allComments ||
      missionSuccess === undefined
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body" });
    }

    // 프롬프트 생성
    const prompt = generateFeedbackPrompt(
      articleTitle,
      articleContent,
      allComments,
      missionSuccess
    );
    console.log("Generated Feedback Prompt:", prompt); // 디버깅용 로그

    // Gemini API 호출
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    // API 응답 처리
    if (
      result.response &&
      result.response.candidates &&
      result.response.candidates.length > 0 &&
      result.response.candidates[0].content &&
      result.response.candidates[0].content.parts &&
      result.response.candidates[0].content.parts.length > 0
    ) {
      const responseText = result.response.candidates[0].content.parts[0].text;
      console.log("Raw AI Feedback Response:", responseText); // 디버깅용 로그

      // 응답 파싱
      const feedback = parseFeedbackResponse(responseText ?? "");

      if (feedback) {
        return res.status(200).json(feedback); // 성공 시 파싱된 피드백 반환
      } else {
        console.error("Failed to parse feedback response from AI.");
        return res.status(500).json({ error: "AI 응답 파싱 실패" });
      }
    } else {
      // API 응답이 비어있거나 형식이 잘못된 경우
      console.error(
        "Invalid or empty response from Gemini API:",
        result.response
      );
      const blockReason = result.response?.promptFeedback?.blockReason;
      const safetyRatings = result.response?.candidates?.[0]?.safetyRatings;
      return res.status(500).json({
        error: `AI 피드백 생성 실패${
          blockReason ? ` (차단 이유: ${blockReason})` : ""
        }`,
        details: safetyRatings,
      });
    }
  } catch (error) {
    console.error("Error in generate-feedback function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 서버 오류";
    return res.status(500).json({ error: `서버 내부 오류: ${errorMessage}` });
  }
}
