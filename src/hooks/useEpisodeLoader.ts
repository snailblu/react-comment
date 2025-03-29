import { useState, useEffect } from 'react';
import { ScriptLine } from './useGameState'; // useGameState에서 ScriptLine 타입 가져오기

// 로컬 script.json 파일의 에피소드 데이터 구조 정의
interface EpisodeData {
  id: string;
  title: string; // title은 null이 아니라고 가정
  intro_dialogues: ScriptLine[]; // intro_dialogues가 ScriptLine 배열이라고 가정
  ending_dialogues: ScriptLine[]; // ending_dialogues가 ScriptLine 배열이라고 가정
  mission_id: string; // 미션 ID 추가 (script.json 구조에 따라 조정 필요)
}

// script.json 파일 전체 구조 정의 (에피소드 ID를 키로 사용)
interface ScriptData {
  [episodeId: string]: EpisodeData;
}

/**
 * episodeId를 기반으로 로컬 script.json에서 에피소드 데이터를 로드합니다.
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
      console.log(`useEpisodeLoader: Loading episode ${episodeId} from script.json...`);
      try {
        // public/script.json 파일 fetch
        const response = await fetch('/script.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch script.json: ${response.statusText}`);
        }
        const scriptData: ScriptData = await response.json();

        // 해당 episodeId의 데이터 찾기
        const data = scriptData[episodeId];

        if (data) {
          // 필요시 데이터 유효성 검사 또는 변환
          setEpisodeData(data);
          console.log('useEpisodeLoader: Episode loaded successfully from script.json:', data);
        } else {
          console.error(`useEpisodeLoader: Episode ${episodeId} not found in script.json.`);
          setEpisodeData(null);
        }
      } catch (error) {
        console.error('useEpisodeLoader: Error loading episode from script.json:', error);
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
