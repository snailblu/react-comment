// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (_req) => {
  // TODO: Implement logic to generate feedback based on mission results
  const feedback = {
    npc_name: '팀장',
    message: '이번 건은 그럭저럭 마무리됐군. 다음엔 좀 더 신경 쓰도록.',
  };

  return new Response(JSON.stringify(feedback), {
    headers: { 'Content-Type': 'application/json' },
  });
});
