import { useState, useEffect } from "react";
// ScriptLine과 함께 EpisodeData 타입 import 추가
import { EpisodeData } from "../types"; // ScriptLine 제거

// 로컬 EpisodeData 정의 제거

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
      console.log("useEpisodeLoader: No episodeId provided.");
      return;
    }

    const loadData = async () => {
      setIsLoadingEpisode(true);
      console.log(
        `useEpisodeLoader: Loading episode ${episodeId} from script.json...`
      );
      try {
        // public/script.json 파일 fetch (상대 경로 사용)
        const response = await fetch("./script.json");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch script.json: ${response.statusText}`
          );
        }
        const scriptData: ScriptData = await response.json();

        // 해당 episodeId의 데이터 찾기
        const data = scriptData[episodeId];

        if (data) {
          // 필요시 데이터 유효성 검사 또는 변환
          setEpisodeData(data);
          console.log(
            "useEpisodeLoader: Episode loaded successfully from script.json:",
            data
          );
        } else {
          console.error(
            `useEpisodeLoader: Episode ${episodeId} not found in script.json.`
          );
          setEpisodeData(null);
        }
      } catch (error) {
        console.error(
          "useEpisodeLoader: Error loading episode from script.json:",
          error
        );
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
