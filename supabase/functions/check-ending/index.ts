// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"; // Use import map alias
import { createClient } from "@supabase/supabase-js"; // Use import map alias

// 환경 변수에서 Supabase URL 및 서비스 키 가져오기
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Supabase 클라이언트 초기화 (서비스 키 사용)
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

Deno.serve(async (req) => {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // TODO: Implement logic to check player progress and determine ending
    // For now, return a default ending type
    const endingType = 'normal_ending'; // Placeholder

    // 예시: 플레이어 ID나 게임 상태 ID를 요청에서 받아올 수 있음
    // const { playerId } = await req.json();
    // const { data: playerState, error } = await supabaseAdmin
    //   .from('player_states') // 가상의 테이블
    //   .select('*')
    //   .eq('player_id', playerId)
    //   .single();
    // if (error) throw error;
    // endingType = determineEnding(playerState);

    return new Response(
      JSON.stringify({ endingType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error) {
    console.error("Error checking ending:", error);
    return new Response(JSON.stringify({ error: "Failed to check ending" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
