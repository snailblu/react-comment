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
  // 댓글 수 기반 최대 추가 반응 수 계산
  const maxAddedReactions = Math.floor(comments.length * 1.5);

  // 기본 닉네임 정의
  const defaultNickname = '연갤러';

  // 전체 댓글 목록을 문자열 형태로 변환 (ID 포함)
  const allCommentsText = comments
    .map(c => `- [ID: ${c.id}] ${c.nickname || '익명'}: ${c.content}`) // ID 추가, 좋아요 수 제거
    .join('\n');

  // 사용자가 마지막으로 작성한 댓글 찾기
  const lastPlayerComment = comments.slice().reverse().find(c => c.is_player);
  const lastPlayerCommentInfo = lastPlayerComment
    ? `*   **중요:** 사용자가 마지막으로 작성한 댓글인 "[ID: ${lastPlayerComment.id}] ${lastPlayerComment.nickname || '익명'}"에 대해 최소 1개 이상의 대댓글을 반드시 생성해주세요.`
    : ''; // 플레이어 댓글이 없으면 이 지침은 추가되지 않음

  // 사용자 댓글 영향력 강조 지침 생성 (수정됨: 추가될 값 예측 및 상한선 적용)
  const playerCommentInfluenceInstruction = lastPlayerComment
    ? `*   **사용자 댓글 영향력 강조:** 사용자가 마지막으로 작성한 댓글 "[ID: ${lastPlayerComment.id}] ${lastPlayerComment.nickname || '익명'}: ${lastPlayerComment.content}"이 **기사 본문의 내용에 찬성하는지 반대하는지**를 **가장 중요하게** 판단하여 **기존 추천/비추천 수에 추가될 값**을 예측해주세요.
    *   **만약 사용자 댓글이 기사 내용에 명백히 찬성한다면:** 기존 추천 수(${reactions.likes})에 **추가될 추천 수**를 **최소 50 이상**으로 생성하고, 기존 비추천 수(${reactions.dislikes})에 **추가될 비추천 수**는 **0 또는 작은 양수**로 생성하세요.
    *   **만약 사용자 댓글이 기사 내용에 명백히 반대한다면:** 기존 비추천 수(${reactions.dislikes})에 **추가될 비추천 수**를 **최소 50 이상**으로 생성하고, 기존 추천 수(${reactions.likes})에 **추가될 추천 수**는 **0 또는 작은 양수**로 생성하세요.
    *   **만약 사용자 댓글의 찬반 입장이 애매하다면:** 현재 추천/비추천 수와 다른 댓글들의 분위기를 종합적으로 고려하여 추가될 값을 생성하되, 사용자 댓글의 영향력은 크게 반영하지 마세요.
    *   **제약 조건:** 생성하는 **추가될 추천수와 추가될 비추천수의 합계**는 **${maxAddedReactions}개를 초과할 수 없습니다.** 이 상한선을 반드시 지켜주세요.
    *   **핵심:** 사용자 댓글의 기사에 대한 명확한 찬성 또는 반대 입장이 다른 모든 요인보다 **압도적으로 중요**하며, **추가될 값** 예측에 **결정적인 영향**을 미쳐야 합니다.`
    : `*   **사용자 댓글 없음:** 사용자가 작성한 댓글이 없으므로, 다른 댓글들의 전반적인 분위기와 현재 추천/비추천 수(${reactions.likes}/${reactions.dislikes})를 바탕으로 **추가될 추천/비추천 값**을 생성해주세요. 단, **추가될 값의 합계는 ${maxAddedReactions}개를 초과할 수 없습니다.**`;

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
*   새로운 댓글은 **정확히** \`닉네임(xxx.xxx): [실제 댓글]\` 형식으로 생성해주세요. (예: 연갤러(123.456): ㅋㅋ 이게 맞지)
*   **기존 댓글**이나 **새로 생성된 댓글**에 대한 **대댓글**도 최대 5개까지 포함해주세요. 대댓글은 답글을 달 대상 댓글의 ID를 사용하여 **정확히** \`-> [원댓글ID] 닉네임(xxx.xxx): [실제 대댓글]\` 형식으로 작성해주세요. (예: -> [tut-1] 반박러(987.654): 뭔 소리임?)
    *   **중요:** 대댓글의 내용 부분에는 **절대로** 원 댓글 작성자의 닉네임이나 IP를 포함하지 마세요. 오직 대댓글 작성자의 정보와 실제 대댓글 텍스트만 포함해야 합니다. (예: \`-> [comment-123] 답글러(789.012): ㄹㅇㅋㅋ\` - **올바른 형식** / \`-> [comment-123] 답글러(789.012): 원댓글러(111.222): ㄹㅇㅋㅋ\` - **잘못된 형식**)
${lastPlayerCommentInfo}
*   **댓글 생성 시 사용자 영향력:** 생성하는 댓글들의 내용과 분위기는 사용자의 마지막 댓글("[ID: ${lastPlayerComment?.id || '없음'}] ${lastPlayerComment?.nickname || '익명'}: ${lastPlayerComment?.content || '내용 없음'}")에 약 **60%** 정도 영향을 받아야 합니다. 사용자 댓글의 논조(긍정/부정)와 유사한 방향으로 댓글을 생성하되, 완전히 동일하지는 않게 다양성을 유지해주세요. (사용자 댓글이 없다면 이 지침은 무시합니다.) (중립 제거)
*   각 댓글과 대댓글은 짧고 자연스러워야 하며, 인터넷 커뮤니티 '디씨인사이드'에서 흔히 사용되는 말투(디씨체)로 작성해주세요.
*   댓글, 대댓글, 닉네임, IP, ID 외 다른 설명은 포함하지 마세요. 각 댓글/대댓글은 줄바꿈으로 구분해주세요.
*   **추가될 예상 추천/비추천 생성 요청:**
${playerCommentInfluenceInstruction}
    *   현재 기사의 추천/비추천 수(${reactions.likes}/${reactions.dislikes})와 댓글들의 전반적인 분위기도 참고하여 **추가될 값**을 생성하세요.
    *   최종적으로 **추가될 예상 추천/비추천 수**를 **정확히** 다음 JSON 형식으로 프롬프트 가장 마지막 줄에 반환해주세요: \`{"added_likes": 추가될_예상_추천수, "added_dislikes": 추가될_예상_비추천수}\`

**댓글 및 대댓글:**
`;

  return prompt.trim(); // 앞뒤 공백 제거 후 반환
};
