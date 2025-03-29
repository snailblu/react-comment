import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSfx, signalInteraction } from '../utils/audioManager';
// Mission -> EpisodeData로 변경
import { ScriptLine, GameFlags, EpisodeData } from '../types';

interface UseStoryProgressionProps {
  currentScript: ScriptLine[];
  currentScriptIndex: number;
  setCurrentScriptIndex: React.Dispatch<React.SetStateAction<number>>;
  gameFlags: GameFlags;
  setGameFlags: React.Dispatch<React.SetStateAction<GameFlags>>;
  episodeData: EpisodeData | null; // Mission -> EpisodeData로 변경
}

interface UseStoryProgressionReturn {
  handleNext: () => void;
  handleChoiceSelect: (choiceId: string | number, nextId?: string | number) => void;
}

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

    let nextIndex = -1;
    if (currentLine.nextId) {
      nextIndex = currentScript.findIndex((line) => line.id === currentLine.nextId);
      if (nextIndex === -1) console.warn(`handleNext: nextId '${currentLine.nextId}' 찾기 실패!`);
    } else if (currentScriptIndex < currentScript.length - 1) {
      nextIndex = currentScriptIndex + 1;
    }

    // nextScene 처리
    if (currentLine.nextScene) {
      console.log(`다음 씬으로 이동: ${currentLine.nextScene}`);
      const missionId = episodeData?.mission_id; // id -> mission_id 로 변경 (EpisodeData 타입 사용)
      if (currentLine.nextScene === 'comment') {
        if (missionId) {
          navigate(`/comment/${missionId}`);
        } else {
          console.error("Mission ID를 찾을 수 없어 CommentScene으로 이동할 수 없습니다.");
          navigate('/');
        }
      } else {
        console.warn(`알 수 없는 nextScene 값: ${currentLine.nextScene}`);
        navigate('/');
      }
      return; // 씬 이동 후 종료
    }

    // 다음 인덱스로 이동 또는 스크립트 종료 처리
    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      console.log('스크립트가 종료되었습니다. (nextScene 없음)');
      navigate('/'); // 타이틀 화면으로 이동
    }
  }, [currentScript, currentScriptIndex, setCurrentScriptIndex, navigate, episodeData]);

  const handleChoiceSelect = useCallback((choiceId: string | number, nextId?: string | number) => {
    signalInteraction();
    playSfx('click');

    // 플래그 업데이트
    const updatedFlags = { ...gameFlags, previousChoice: choiceId };
    setGameFlags(updatedFlags);
    console.log(`선택됨: ${choiceId}, 플래그 업데이트:`, updatedFlags);

    let nextIndex = -1;
    if (nextId) {
      nextIndex = currentScript.findIndex((line) => line.id === nextId);
      if (nextIndex === -1) console.warn(`handleChoiceSelect: 선택지의 nextId '${nextId}' 찾기 실패!`);
    }

    const nextDialogue = nextIndex !== -1 ? currentScript[nextIndex] : null;

    // nextScene 처리
    if (nextDialogue && nextDialogue.nextScene) {
      console.log(`선택지 결과 후 다음 씬으로 이동: ${nextDialogue.nextScene}`);
      const missionId = episodeData?.mission_id; // id -> mission_id 로 변경 (EpisodeData 타입 사용)
      if (nextDialogue.nextScene === 'comment') {
        if (missionId) {
          navigate(`/comment/${missionId}`);
        } else {
          console.error("Mission ID를 찾을 수 없어 CommentScene으로 이동할 수 없습니다.");
          navigate('/');
        }
      } else {
        console.warn(`알 수 없는 nextScene 값: ${nextDialogue.nextScene}`);
        navigate('/');
      }
      return; // 씬 이동 후 종료
    }

    // 다음 인덱스로 이동 또는 스크립트 종료/경고 처리
    if (nextIndex !== -1) {
      setCurrentScriptIndex(nextIndex);
    } else {
      console.log(`선택지 '${choiceId}'에 대한 다음 대사(nextId: ${nextId})를 찾을 수 없습니다! (nextScene 없음)`);
      if (currentScriptIndex < currentScript.length - 1) {
        console.warn(`다음 순서 대사로 이동합니다.`);
        setCurrentScriptIndex(prevIndex => prevIndex + 1); // 임시 방편
      } else {
        console.log('스크립트가 종료되었습니다. (선택지 후 nextId 없음)');
        navigate('/');
      }
    }
  }, [currentScript, currentScriptIndex, setCurrentScriptIndex, gameFlags, setGameFlags, navigate, episodeData]);

  return { handleNext, handleChoiceSelect };
};

export default useStoryProgression;
