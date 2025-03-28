import { Comment, Opinion } from '../types'; // Comment와 Opinion 타입을 types/index.ts 에서 가져온다고 가정합니다.

/**
 * Gemini API 호출을 위한 프롬프트를 생성합니다.
 *
 * @param articleTitle 기사 제목
 * @param articleContent 기사 본문
 * @param comments 현재 댓글 목록
 * @param opinion 현재 여론 (긍정, 부정, 중립 비율)
 * @returns 생성된 프롬프트 문자열
 */
export const generateCommentPrompt = (
  articleTitle: string,
  articleContent: string,
  comments: Comment[],
  opinion: Opinion
): string => {
  // 댓글 목록을 간단한 문자열 형태로 변환 (예: 최신 5개만 표시)
  const recentComments = comments
    .slice(-5) // 최근 5개 댓글만 사용 (조정 가능)
    .map(c => `- ${c.content} (좋아요: ${c.likes})`)
    .join('\n');

  // 여론을 문자열로 요약
  const opinionSummary = `현재 여론: 긍정 ${opinion.positive}%, 부정 ${opinion.negative}%, 중립 ${opinion.neutral}%`;

  // 프롬프트 템플릿
  const prompt = `
당신은 주어진 뉴스 기사와 현재 댓글, 여론 상황을 분석하여 다음 댓글을 생성하는 AI입니다.

**뉴스 기사 정보:**
*   제목: ${articleTitle}
*   본문 요약: ${articleContent.substring(0, 200)}... (본문이 길 경우 일부만 표시)

**현재 댓글 상황:**
*   최근 댓글:
${recentComments || '(댓글 없음)'}
*   ${opinionSummary}

**요청:**
위 정보를 바탕으로, 현재 대화의 맥락과 여론에 맞는 새로운 온라인 댓글 3~5개를 생성해주세요.
각 댓글은 짧고 자연스러워야 하며, 실제 사용자들이 작성한 것처럼 보여야 합니다.
댓글만 생성하고 다른 설명은 포함하지 마세요. 각 댓글은 줄바꿈으로 구분해주세요.

댓글:
`;

  return prompt.trim(); // 앞뒤 공백 제거 후 반환
};
