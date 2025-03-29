import { useCallback } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom'; // NavigateFunction 추가
import { playSfx, signalInteraction } from '../utils/audioManager';
import { ScriptLine, GameFlags, EpisodeData } from '../types';

interface UseStoryProgressionProps {
  currentScript: ScriptLine[];
  currentScriptIndex: number;
  setCurrentScriptIndex: React.Dispatch<React.SetStateAction<number>>;
  gameFlags: GameFlags;
  setGameFlags: React.Dispatch<React.SetStateAction<GameFlags>>;
  episodeData: EpisodeData | null;
}

interface UseStoryProgressionReturn {
  handleNext: () => void;
  handleChoiceSelect: (choiceId: string | number, nextId?: string | number) => void;
}

// --- Helper Functions ---

/**
 * 주어진 ID에 해당하는 스크립트 라인의 인덱스를 찾습니다.
 * @param targetId 찾을 스크립트 라인의 ID
 * @param script 검색할 스크립트 배열
 * @returns 찾은 인덱스 또는 -1
 */
const findNextScriptIndex = (targetId: string | number | undefined, script: ScriptLine[]): number => {
  if (!targetId) return -1;
  const index = script.findIndex((line) => line.id === targetId);
  if (index === -1) {
    console.warn(`findNextScriptIndex: ID '${targetId}'를 스크립트에서 찾을 수 없습니다.`);
  }
  return index;
};

/**
 * 주어진 씬 이름에 따라 적절한 경로로 이동합니다.
 * @param sceneName 이동할 씬의 이름
 * @param episodeData 현재 에피소드 데이터 (미션 ID 포함)
 * @param navigate react-router-dom의 navigate 함수
 * @returns 씬 전환이 발생했는지 여부
 */
const handleSceneTransition = (
  sceneName: string | undefined,
  episodeData: EpisodeData | null,
  navigate: NavigateFunction
): boolean => {
  if (!sceneName) return false;

  console.log(`다음 씬으로 이동 시도: ${sceneName}`);
  const missionId = episodeData?.mission_id;

  if (sceneName === 'comment') {
    if (missionId) {
      navigate(`/comment/${missionId}`);
    } else {
      console.error("Mission ID를 찾을 수 없어 CommentScene으로 이동할 수 없습니다.");
      navigate('/');
    }
  } else {
    console.warn(`알 수 없는 nextScene 값: ${sceneName}`);
    navigate('/');
  }
  return true; // 씬 전환 발생
};


// --- Hook Definition ---

const useStoryProgression = ({
  currentScript,
  currentScriptIndex,
  setCurrentScriptIndex,
  gameFlags,
  setGameFlags,
  episodeData, // episodeData 받기
}: UseStoryProgressionProps): UseStoryProgressionReturn => {
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    const currentLine = currentScript[currentScriptIndex];
    if (!currentLine || currentLine.type === 'choice') return;

    signalInteraction();
    playSfx('click');

    // 헬퍼 함수를 사용하여 씬 전환 처리
    if (handleSceneTransition(currentLine.nextScene, episodeData, navigate)) {
      return; // 씬 전환이 발생했으면 여기서 종료
    }

    // 헬퍼 함수를 사용하여 다음 인덱스 찾기
    let nextIndex = findNextScriptIndex(currentLine.nextId, currentScript);

    // nextId가 없거나 찾지 못했고, 현재가 마지막 라인이 아니면 다음 순서로 이동
    if (nextIndex === -1 && currentScriptIndex < currentScript.length - 1) {
      nextIndex = currentScriptIndex + 1;
    }

    // 다음 인덱스로 이동 또는 스크립트 종료 처리
    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      console.log('스크립트가 종료되었습니다.');
      navigate('/'); // 스크립트 종료 시 타이틀 화면으로 이동
    }
  }, [currentScript, currentScriptIndex, setCurrentScriptIndex, navigate, episodeData]);

  const handleChoiceSelect = useCallback((choiceId: string | number, nextId?: string | number) => {
    signalInteraction();
    playSfx('click');

    // 플래그 업데이트
    const updatedFlags = { ...gameFlags, previousChoice: choiceId };
    setGameFlags(updatedFlags);
    console.log(`선택됨: ${choiceId}, 플래그 업데이트:`, updatedFlags);

    // 헬퍼 함수를 사용하여 다음 인덱스 찾기
    const nextIndex = findNextScriptIndex(nextId, currentScript);
    const nextDialogue = nextIndex !== -1 ? currentScript[nextIndex] : null;

    // 헬퍼 함수를 사용하여 씬 전환 처리
    if (handleSceneTransition(nextDialogue?.nextScene, episodeData, navigate)) {
      return; // 씬 전환이 발생했으면 여기서 종료
    }

    // 다음 인덱스로 이동 또는 스크립트 종료/경고 처리
    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      // nextId가 유효하지 않거나 찾지 못한 경우
      console.warn(`선택지 '${choiceId}'에 대한 다음 대사(nextId: ${nextId})를 찾을 수 없습니다.`);
      // 스크립트의 다음 라인으로 이동할지, 아니면 종료할지 결정 필요
      // 현재 로직: 다음 라인이 있으면 경고 후 이동, 없으면 종료
      if (currentScriptIndex < currentScript.length - 1) {
        console.warn(`다음 순서 대사로 이동합니다.`);
        setCurrentScriptIndex(prevIndex => prevIndex + 1); // 다음 순서로 이동 (기존 로직 유지)
      } else {
        console.log('스크립트가 종료되었습니다. (선택지 후 다음 대사 없음)');
        navigate('/'); // 스크립트 종료 시 타이틀 화면으로 이동
      }
    }
  }, [currentScript, currentScriptIndex, setCurrentScriptIndex, gameFlags, setGameFlags, navigate, episodeData]);

  return { handleNext, handleChoiceSelect };
};

export default useStoryProgression;
