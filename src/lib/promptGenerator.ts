import { Comment, Opinion } from '../types'; // Comment와 Opinion 타입을 types/index.ts 에서 가져온다고 가정합니다.

/**
 * Gemini API 호출을 위한 프롬프트를 생성합니다.
 *
 * @param articleTitle 기사 제목
 * @param articleContent 기사 본문
 * @param comments 현재 댓글 목록
 * @returns 생성된 프롬프트 문자열 (단순 댓글 생성 요청)
 */
export const generateCommentPrompt = (
  articleTitle: string,
  articleContent: string,
  comments: Comment[]
): string => {
  // 전체 댓글 목록을 문자열 형태로 변환
  const allCommentsText = comments
    .map(c => `- ${c.nickname || '익명'}: ${c.content} (좋아요: ${c.likes})`) // nickname 사용, 없을 경우 '익명'
    .join('\n');

  // 프롬프트 템플릿 (단순화)
  const prompt = `
당신은 주어진 뉴스 기사와 현재 댓글들을 분석하여, 새로운 댓글을 생성하는 AI입니다.

**뉴스 기사 정보:**
*   제목: ${articleTitle}
*   본문 요약: ${articleContent.substring(0, 200)}... (본문이 길 경우 일부만 표시)

**현재 댓글 목록:**
${allCommentsText || '(댓글 없음)'}

**요청:**
*   위 정보를 바탕으로, 현재 대화의 맥락에 맞는 새로운 온라인 댓글 3~5개를 생성해주세요.
*   각 댓글 앞에 임의의 사용자 닉네임과 가상 IP 주소를 \`닉네임(xxx.xxx)\` 형식으로 함께 생성해주세요. (예: 유동닉(123.456): 댓글 내용)
*   각 댓글은 짧고 자연스러워야 하며, 인터넷 커뮤니티 '디씨인사이드'에서 흔히 사용되는 말투(디씨체)로 작성해주세요.
*   댓글과 닉네임, IP 외 다른 설명은 포함하지 마세요. 각 댓글은 줄바꿈으로 구분해주세요.

**댓글:**
`;

  return prompt.trim(); // 앞뒤 공백 제거 후 반환
};
