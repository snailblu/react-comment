import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 URL과 anon key를 환경 변수에서 가져옵니다.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 환경 변수가 설정되지 않은 경우 오류를 발생시킵니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

// Supabase 클라이언트를 생성하고 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 특정 에피소드 ID에 대한 데이터를 가져오는 비동기 함수입니다.
export const getEpisodeData = async (episodeId: string) => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('id, title, intro_dialogues, ending_dialogues') // 필요한 컬럼만 선택
      .eq('id', episodeId) // 주어진 episodeId와 일치하는 행 필터링
      .single(); // 단일 행만 반환하도록 설정

    if (error) {
      console.error('Error fetching episode data:', error);
      throw error; // 오류 발생 시 예외 처리
    }

    return data; // 조회된 데이터 반환
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null; // 예외 발생 시 null 반환
  }
};

// 필요한 경우 다른 Supabase 관련 함수들을 여기에 추가할 수 있습니다.
// 예: saveGame, loadGame 등
