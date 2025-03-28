import { useState, useEffect } from 'react';
import { getEpisodeData } from '../services/supabase';
import { ScriptLine } from './useGameState'; // useGameState에서 ScriptLine 타입 가져오기

// getEpisodeData가 반환하는 데이터 구조 정의
// supabase.ts의 select 쿼리와 episodes 테이블 스키마 기반
interface EpisodeData {
  id: string;
  title: string | null;
  intro_dialogues: ScriptLine[] | null; // intro_dialogues가 ScriptLine 배열이라고 가정
  ending_dialogues: ScriptLine[] | null; // ending_dialogues가 ScriptLine 배열이라고 가정
}

/**
 * episodeId를 기반으로 Supabase에서 에피소드 데이터를 로드합니다.
 * @param episodeId 로드할 에피소드의 ID.
 * @returns {{ episodeData: EpisodeData | null, isLoadingEpisode: boolean }} 에피소드 데이터와 로딩 상태.
 */
const useEpisodeLoader = (episodeId: string | null) => {
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(true);

  useEffect(() => {
    // episodeId가 없으면 로딩 중단
    if (!episodeId) {
      setIsLoadingEpisode(false);
      setEpisodeData(null);
      console.log('useEpisodeLoader: No episodeId provided.');
      return;
    }

    const loadData = async () => {
      setIsLoadingEpisode(true);
      console.log(`useEpisodeLoader: Loading episode ${episodeId}...`);
      try {
        // getEpisodeData의 반환 타입에 따라 타입 단언 필요할 수 있음
        const data = await getEpisodeData(episodeId) as EpisodeData | null;
        if (data) {
          // 필요시 데이터 유효성 검사 또는 변환
          // 현재는 data.intro_dialogues가 스크립트 배열이라고 가정
          setEpisodeData(data);
          console.log('useEpisodeLoader: Episode loaded successfully:', data);
        } else {
          console.error(`useEpisodeLoader: Episode ${episodeId} not found or failed to load.`);
          setEpisodeData(null);
        }
      } catch (error) {
        console.error('useEpisodeLoader: Error loading episode:', error);
        setEpisodeData(null);
      } finally {
        setIsLoadingEpisode(false);
      }
    };

    loadData();

  }, [episodeId]); // episodeId가 변경될 때 다시 로드

  return { episodeData, isLoadingEpisode };
};

export default useEpisodeLoader;
