import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { useTranslation } from "react-i18next"; // Import useTranslation

// Define a more specific type for script data if possible, using 'any' for now
type ScriptData = any;

/**
 * 스크립트 JSON 파일을 로드하고 번역하는 커스텀 Hook.
 * @returns {{scriptData: ScriptData, isLoadingScript: boolean}} 번역된 스크립트 데이터와 로딩 상태.
 */
const useScriptLoader = () => {
  const { t, i18n } = useTranslation("script"); // Initialize useTranslation with 'script' namespace
  const [scriptData, setScriptData] = useState<ScriptData>({}); // Initialize with an empty object or appropriate type
  const [isLoadingScript, setIsLoadingScript] = useState(true);

  // Function to translate script data, wrapped in useCallback
  const translateScriptData = useCallback(
    (rawData: any): ScriptData => {
      const translatedData = JSON.parse(JSON.stringify(rawData)); // Deep copy to avoid modifying original fetch cache

      for (const episodeId in translatedData) {
        if (Object.prototype.hasOwnProperty.call(translatedData, episodeId)) {
          const episode = translatedData[episodeId];

          // Translate title
          if (episode.title) {
            episode.title = t(episode.title);
          }

          // Translate intro_dialogues
          if (Array.isArray(episode.intro_dialogues)) {
            episode.intro_dialogues.forEach((dialogue: any) => {
              if (dialogue.text) {
                dialogue.text = t(dialogue.text);
              }
              // Translate choices within dialogue
              if (
                dialogue.type === "choice" &&
                Array.isArray(dialogue.choices)
              ) {
                dialogue.choices.forEach((choice: any) => {
                  if (choice.text) {
                    choice.text = t(choice.text);
                  }
                });
              }
            });
          }

          // Translate ending_dialogues (if structure is similar)
          if (Array.isArray(episode.ending_dialogues)) {
            episode.ending_dialogues.forEach((dialogue: any) => {
              if (dialogue.text) {
                dialogue.text = t(dialogue.text);
              }
              if (
                dialogue.type === "choice" &&
                Array.isArray(dialogue.choices)
              ) {
                dialogue.choices.forEach((choice: any) => {
                  if (choice.text) {
                    choice.text = t(choice.text);
                  }
                });
              }
            });
          }
        }
      }
      return translatedData;
    },
    [t]
  ); // Add t as a dependency for useCallback

  useEffect(() => {
    console.log(
      `useScriptLoader: 스크립트 로딩 시작... (언어: ${i18n.language})`
    );
    setIsLoadingScript(true); // Set loading true when language changes
    // Electron 환경 호환성을 위해 상대 경로 사용
    fetch("./script.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((rawData) => {
        // Translate the fetched data
        const translatedData = translateScriptData(rawData);
        // console.log("useScriptLoader: Translated Data:", JSON.stringify(translatedData).substring(0, 500) + "..."); // Remove log
        setScriptData(translatedData);
        setIsLoadingScript(false);
        console.log(
          `useScriptLoader: 스크립트 로딩 및 번역 완료 (언어: ${i18n.language})`
        );
      })
      .catch((error) => {
        console.error("useScriptLoader: 스크립트 로딩/번역 실패:", error);
        setIsLoadingScript(false); // 에러 발생 시에도 로딩 상태는 해제
      });
  }, [i18n.language, t, translateScriptData]); // Add translateScriptData to dependency array

  return { scriptData, isLoadingScript };
};

export default useScriptLoader;
