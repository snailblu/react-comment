import { useEffect, useState } from "react";
import useScriptLoader from "./useScriptLoader";
import { useStoryStore } from "../stores/storyStore";
import { ScriptLine, AllEpisodeData } from "../types"; // Use the correct type

/**
 * Hook to load and manage the script data for the current episode.
 * It fetches all script data using useScriptLoader and sets the relevant
 * episode's script into the Zustand storyStore.
 *
 * @param episodeId The ID of the episode script to load.
 * @returns An object containing the loading state and any error for the current episode script.
 */
const useCurrentEpisodeScript = (episodeId: string | null) => {
  const { scriptData: allScriptData, isLoadingScript: isLoadingAllScripts } =
    useScriptLoader();
  const { setScriptData } = useStoryStore();

  const [isLoadingCurrentScript, setIsLoadingCurrentScript] =
    useState<boolean>(true);
  const [currentScriptError, setCurrentScriptError] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Start loading current script if we are loading all scripts or episodeId is null initially
    if (isLoadingAllScripts || !episodeId) {
      setIsLoadingCurrentScript(true);
      setCurrentScriptError(null); // Reset error on new load attempt
      return;
    }

    // All scripts have been loaded, now process for the current episode
    console.log(
      `useCurrentEpisodeScript: Processing loaded data for episode ${episodeId}. isLoadingAllScripts: ${isLoadingAllScripts}`
    );

    if (
      allScriptData &&
      episodeId &&
      allScriptData[episodeId]?.intro_dialogues
    ) {
      console.log(
        `useCurrentEpisodeScript: Found script for episode ${episodeId}. Setting data in store.`
      );
      try {
        // Ensure intro_dialogues is an array of ScriptLine
        const scriptToSet: ScriptLine[] =
          allScriptData[episodeId].intro_dialogues;
        if (!Array.isArray(scriptToSet)) {
          throw new Error("intro_dialogues is not an array");
        }
        setScriptData(scriptToSet);
        setCurrentScriptError(null);
      } catch (error) {
        console.error(
          "useCurrentEpisodeScript: Error setting script data:",
          error
        );
        setCurrentScriptError(
          `Error processing script data for episode ${episodeId}.`
        );
        setScriptData([]); // Clear script data on error
      }
    } else {
      console.warn(
        `useCurrentEpisodeScript: Could not find intro_dialogues for episode ${episodeId} in loaded script data.`
      );
      setCurrentScriptError(`Script data not found for episode ${episodeId}.`);
      setScriptData([]); // Clear script data if not found
    }

    // Finished processing for the current episode
    setIsLoadingCurrentScript(false);

    // TODO: Handle loading other script parts (e.g., ending_dialogues) if necessary based on game logic
  }, [allScriptData, episodeId, isLoadingAllScripts, setScriptData]);

  return { isLoadingCurrentScript, currentScriptError };
};

export default useCurrentEpisodeScript;
