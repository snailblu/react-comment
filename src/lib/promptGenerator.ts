import { Comment, Opinion, ArticleReactions } from '../types'; // ArticleReactions 타입 추가

/**
 * Gemini API 호출을 위한 프롬프트를 생성합니다.
 *
 * @param articleTitle 기사 제목
 * @param articleContent 기사 본문
 * @param comments 현재 댓글 목록
 * @param reactions 현재 기사 추천/비추천 수
 * @returns 생성된 프롬프트 문자열 (단순 댓글 생성 요청)
 */
export const generateCommentPrompt = (
  articleTitle: string,
  articleContent: string,
  comments: Comment[],
  reactions: ArticleReactions // reactions 파라미터 추가
): string => {
  // 기본 닉네임 정의
  const defaultNickname = '연갤러';

  // 전체 댓글 목록을 문자열 형태로 변환 (ID 포함)
  const allCommentsText = comments
    .map(c => `- [ID: ${c.id}] ${c.nickname || '익명'}: ${c.content} (좋아요: ${c.likes})`) // ID 추가
    .join('\n');

  // 프롬프트 템플릿 (대댓글 형식 수정 및 닉네임 생성 규칙 추가)
  const prompt = `
당신은 주어진 뉴스 기사와 현재 댓글들을 분석하여, 새로운 댓글을 생성하는 AI입니다.

**뉴스 기사 정보:**
*   제목: ${articleTitle}
*   본문 요약: ${articleContent.substring(0, 200)}... (본문이 길 경우 일부만 표시)
*   현재 추천/비추천: 추천 ${reactions.likes} / 비추천 ${reactions.dislikes}

**현재 댓글 목록:**
${allCommentsText || '(댓글 없음)'}

**요청:**
*   위 정보를 바탕으로, 현재 대화의 맥락과 기사의 추천/비추천 수를 고려하여 새로운 온라인 댓글과 대댓글을 포함하여 총 8~10개를 생성해주세요.
*   **닉네임 생성 규칙:**
    *   각 댓글과 대댓글 앞에 닉네임을 생성해주세요. 닉네임은 다음 규칙을 따릅니다:
    *   1.  **60% 확률**로 기본 닉네임 \`${defaultNickname}\`을 사용합니다.
    *   2.  나머지 **40% 확률**로는 자유롭게 새로운 닉네임을 생성합니다.
    *   닉네임 뒤에는 가상 IP 주소를 \`(xxx.xxx)\` 형식으로 붙여 \`닉네임(xxx.xxx)\` 형태로 만들어주세요. (예: 연갤러(123.456), 새로운닉(789.012))
*   새로운 댓글은 **정확히** \`닉네임(xxx.xxx): 댓글 내용\` 형식으로 생성해주세요.
*   **기존 댓글**이나 **새로 생성된 댓글**에 대한 **대댓글**도 최대 5개까지 포함해주세요. 대댓글은 답글을 달 대상 댓글의 ID를 사용하여 **정확히** \`-> [원댓글ID] 닉네임(xxx.xxx): 대댓글 내용\` 형식으로 작성해주세요.
    *   **중요:** 대댓글의 내용 부분에는 **절대로** 원 댓글 작성자의 닉네임이나 IP를 포함하지 마세요. 오직 대댓글 작성자의 정보와 실제 대댓글 텍스트만 포함해야 합니다. (예: \`-> [comment-123] 답글러(789.012): ㄹㅇㅋㅋ\` - **올바른 형식** / \`-> [comment-123] 답글러(789.012): 원댓글러(111.222): ㄹㅇㅋㅋ\` - **잘못된 형식**)
*   각 댓글과 대댓글은 짧고 자연스러워야 하며, 인터넷 커뮤니티 '디씨인사이드'에서 흔히 사용되는 말투(디씨체)로 작성해주세요.
*   댓글, 대댓글, 닉네임, IP, ID 외 다른 설명은 포함하지 마세요. 각 댓글/대댓글은 줄바꿈으로 구분해주세요.
*   **추가 요청:** 현재 기사의 추천/비추천 수(${reactions.likes}/${reactions.dislikes}) 변화를 반영하여, 앞으로 예상되는 추천/비추천 수를 JSON 형식으로 반환해주세요. 형식: \`{"likes": 예상_추천수, "dislikes": 예상_비추천수}\` 이 JSON 객체는 프롬프트의 가장 마지막 줄에 위치해야 합니다.

**댓글 및 대댓글:**
`;

  return prompt.trim(); // 앞뒤 공백 제거 후 반환
};
