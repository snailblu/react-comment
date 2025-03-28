// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@^2";

// 환경 변수에서 Supabase URL 및 서비스 키 가져오기
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  // 실제 배포 시에는 더 강력한 오류 처리 필요
}

// Supabase 클라이언트 초기화 (서비스 키 사용)
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

// 간단한 키워드 기반 여론 점수 계산 함수
const calculateOpinionScore = (comment: string): { positive: number; negative: number } => {
  const positiveKeywords = ["좋아요", "최고", "추천", "대박", "짱"];
  const negativeKeywords = ["싫어요", "최악", "비추", "별로", "쓰레기"];
  let score = { positive: 0, negative: 0 };

  positiveKeywords.forEach(keyword => {
    if (comment.includes(keyword)) {
      score.positive += 10; // 긍정 키워드 발견 시 +10
    }
  });

  negativeKeywords.forEach(keyword => {
    if (comment.includes(keyword)) {
      score.negative += 10; // 부정 키워드 발견 시 +10
    }
  });

  // 점수 상한선 설정 (예: 최대 50)
  score.positive = Math.min(score.positive, 50);
  score.negative = Math.min(score.negative, 50);

  return score;
};

Deno.serve(async (req) => {
  // CORS 헤더 설정 (개발 및 테스트용 - 실제 배포 시 더 엄격하게 설정)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // OPTIONS 요청 처리 (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 요청 본문에서 mission_id와 comment 추출
    const { mission_id, comment } = await req.json();

    if (!mission_id || typeof comment !== 'string') {
      return new Response(JSON.stringify({ error: "Missing mission_id or comment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. 현재 여론 상태 가져오기
    const { data: currentOpinion, error: fetchError } = await supabaseAdmin
      .from('opinions')
      .select('positive, negative, neutral')
      .eq('mission_id', mission_id)
      .single();

    if (fetchError || !currentOpinion) {
      console.error("Error fetching current opinion:", fetchError);
      // 만약 해당 mission_id의 opinion이 없다면 새로 생성하는 로직 추가 고려
      return new Response(JSON.stringify({ error: "Failed to fetch current opinion or opinion not found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. 댓글 기반으로 점수 계산
    const scoreChange = calculateOpinionScore(comment);

    // 3. 새로운 여론 비율 계산 (기존 비율에 변화량 적용)
    // 간단하게, 긍정/부정 점수 변화만큼 중립에서 빼거나 더함
    let newPositive = Math.min(100, Math.max(0, currentOpinion.positive + scoreChange.positive - scoreChange.negative));
    let newNegative = Math.min(100, Math.max(0, currentOpinion.negative + scoreChange.negative - scoreChange.positive));
    // 중립 비율 조정 (합계 100 유지)
    let newNeutral = 100 - newPositive - newNegative;
    // 만약 newNeutral이 음수가 되면, 긍정/부정 비율을 비례적으로 조정 (여기서는 단순화)
    if (newNeutral < 0) {
        // 간단히 긍정/부정 중 더 큰 쪽에서 초과분을 빼서 중립을 0으로 맞춤
        if (newPositive > newNegative) {
            newPositive += newNeutral; // newNeutral은 음수
        } else {
            newNegative += newNeutral;
        }
        newNeutral = 0;
        // 합계가 100이 되도록 재조정 (하나가 100을 넘을 수 있음)
        if (newPositive + newNegative > 100) {
            if (newPositive > newNegative) newPositive = 100 - newNegative;
            else newNegative = 100 - newPositive;
        }
    }


    // 4. opinions 테이블 업데이트
    const { data: updatedOpinion, error: updateError } = await supabaseAdmin
      .from('opinions')
      .update({
        positive: newPositive,
        negative: newNegative,
        neutral: newNeutral,
        updated_at: new Date().toISOString(), // 업데이트 시간 기록
      })
      .eq('mission_id', mission_id)
      .select() // 업데이트된 데이터 반환 요청
      .single(); // 단일 행 업데이트 확인

    if (updateError) {
      console.error("Error updating opinion:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update opinion" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. 업데이트된 여론 데이터 반환
    return new Response(
      JSON.stringify(updatedOpinion),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
