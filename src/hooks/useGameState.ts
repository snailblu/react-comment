import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

// --- 타입 정의 (export 추가) ---

// 선택지 옵션 타입 (Choices.tsx와 일치 또는 공유 타입 파일로 이동 고려)
export interface ChoiceOption { // export 추가
  id: string | number;
  text: string;
  nextId?: string | number;
}

// 스크립트 라인 타입
export interface ScriptLine { // export 추가
  id: string | number;
  type: string; // 'dialogue', 'choice', 'narrator' 등
  character?: string;
  text?: string;
  choices?: ChoiceOption[];
  nextId?: string | number;
  condition?: {
    flag: string;
    value: any; // 조건 값은 다양할 수 있음
  };
  altText?: string;
  expression?: string;
  // 필요한 다른 속성 추가 가능
}

// 스크립트 데이터 타입 (ScriptLine 배열)
export type ScriptData = ScriptLine[]; // export 추가

// 게임 플래그 타입 (문자열 키와 임의의 값)
export type GameFlags = Record<string, any>; // export 추가

// useGameState Hook 반환 타입
export interface GameStateHook { // export 추가
  currentScriptIndex: number;
  gameFlags: GameFlags;
  currentEpisodeId: string | null; // 현재 에피소드 ID
  sceneProgress: string; // 현재 씬 진행 단계 (예: 'intro', 'mission', 'ending')
  currentMissionId: string | null; // 현재 진행 중인 미션 ID
  remainingAttempts: number; // 현재 미션 남은 시도 횟수
  setCurrentScriptIndex: Dispatch<SetStateAction<number>>;
  setGameFlags: Dispatch<SetStateAction<GameFlags>>;
  setCurrentEpisodeId: Dispatch<SetStateAction<string | null>>;
  setSceneProgress: Dispatch<SetStateAction<string>>;
  setCurrentMissionId: Dispatch<SetStateAction<string | null>>; // 미션 ID setter
  setRemainingAttempts: Dispatch<SetStateAction<number>>; // 시도 횟수 setter
  saveGame: () => void;
  loadGame: () => void;
}

const SAVE_KEY = 'saveDataVn'; // 로컬 스토리지 키 정의

// Hook 함수 시그니처에 타입 적용
const useGameState = (scriptData: ScriptData): GameStateHook => {
  // useState에 제네릭 타입 적용
  const [currentScriptIndex, setCurrentScriptIndex] = useState<number>(0);
  const [gameFlags, setGameFlags] = useState<GameFlags>({});
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [sceneProgress, setSceneProgress] = useState<string>('intro');
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null); // 미션 ID 상태 추가
  const [remainingAttempts, setRemainingAttempts] = useState<number>(0); // 남은 시도 횟수 상태 추가 (초기값 0)

  // --- 로컬 스토리지에서 초기 상태 로드 ---
  useEffect(() => {
    console.log('useGameState: 게임 상태 로드 시도...');
    const savedData = localStorage.getItem(SAVE_KEY);
    let loadedIndex = 0;
    let loadedFlags = {};
    let loadedEpisodeId: string | null = null;
    let loadedSceneProgress: string = 'intro';
    let loadedMissionId: string | null = null; // 로드할 미션 ID 변수
    let loadedAttempts: number = 0; // 로드할 남은 시도 횟수 변수

    if (savedData) {
      try {
        // 파싱된 데이터 타입 정의 (부분적으로)
        const parsedData: Partial<{
          currentScriptIndex: number;
          gameFlags: GameFlags;
          currentEpisodeId: string | null;
          sceneProgress: string;
          currentMissionId: string | null; // 파싱 타입에 추가
          remainingAttempts: number; // 파싱 타입에 추가
        }> = JSON.parse(savedData);

        // currentScriptIndex 로드 및 유효성 검사
        if (typeof parsedData.currentScriptIndex === 'number' && parsedData.currentScriptIndex >= 0) {
          // 스크립트 데이터가 로드된 경우 추가적인 범위 검사
          if (scriptData && scriptData.length > 0 && parsedData.currentScriptIndex >= scriptData.length) {
            console.warn(`저장된 인덱스(${parsedData.currentScriptIndex})가 스크립트 범위(${scriptData.length})를 벗어납니다. 0으로 초기화합니다.`);
            loadedIndex = 0; // 범위를 벗어나면 0으로 초기화
          } else {
            loadedIndex = parsedData.currentScriptIndex;
            console.log('useGameState: 저장된 인덱스 로드:', loadedIndex);
          }
        } else if (parsedData.currentScriptIndex !== undefined) { // undefined가 아닐 때만 경고
          console.warn('useGameState: 저장된 currentScriptIndex가 유효하지 않습니다:', parsedData.currentScriptIndex);
        }

        // gameFlags 로드 및 유효성 검사
        if (typeof parsedData.gameFlags === 'object' && parsedData.gameFlags !== null) {
          loadedFlags = parsedData.gameFlags;
          console.log('useGameState: 저장된 플래그 로드:', loadedFlags);
        } else if (parsedData.gameFlags !== undefined) {
          console.warn('useGameState: 저장된 gameFlags가 유효한 객체가 아닙니다:', parsedData.gameFlags);
        }

        // currentEpisodeId 로드 (문자열 또는 null 허용)
        if (typeof parsedData.currentEpisodeId === 'string' || parsedData.currentEpisodeId === null) {
            loadedEpisodeId = parsedData.currentEpisodeId;
            console.log('useGameState: 저장된 에피소드 ID 로드:', loadedEpisodeId);
        } else if (parsedData.currentEpisodeId !== undefined) {
            console.warn('useGameState: 저장된 currentEpisodeId가 유효하지 않습니다:', parsedData.currentEpisodeId);
        }

        // sceneProgress 로드 (문자열)
        if (typeof parsedData.sceneProgress === 'string') {
            loadedSceneProgress = parsedData.sceneProgress;
            console.log('useGameState: 저장된 씬 진행 상태 로드:', loadedSceneProgress);
        } else if (parsedData.sceneProgress !== undefined) {
            console.warn('useGameState: 저장된 sceneProgress가 유효하지 않습니다:', parsedData.sceneProgress);
        }

        // currentMissionId 로드 (문자열 또는 null)
        if (typeof parsedData.currentMissionId === 'string' || parsedData.currentMissionId === null) {
            loadedMissionId = parsedData.currentMissionId;
            console.log('useGameState: 저장된 미션 ID 로드:', loadedMissionId);
        } else if (parsedData.currentMissionId !== undefined) {
            console.warn('useGameState: 저장된 currentMissionId가 유효하지 않습니다:', parsedData.currentMissionId);
        }

        // remainingAttempts 로드 (숫자)
        if (typeof parsedData.remainingAttempts === 'number' && parsedData.remainingAttempts >= 0) {
            loadedAttempts = parsedData.remainingAttempts;
            console.log('useGameState: 저장된 남은 시도 횟수 로드:', loadedAttempts);
        } else if (parsedData.remainingAttempts !== undefined) {
            console.warn('useGameState: 저장된 remainingAttempts가 유효하지 않습니다:', parsedData.remainingAttempts);
        }

      } catch (e) {
        console.error('useGameState: 저장된 데이터 파싱 오류:', e);
      }
    } else {
      console.log('useGameState: 저장된 데이터 없음, 초기 상태 사용');
    }

    // 상태 업데이트
    setCurrentScriptIndex(loadedIndex);
    setGameFlags(loadedFlags);
    setCurrentEpisodeId(loadedEpisodeId);
    setSceneProgress(loadedSceneProgress);
    setCurrentMissionId(loadedMissionId); // 미션 ID 상태 업데이트
    setRemainingAttempts(loadedAttempts); // 남은 시도 횟수 상태 업데이트

  // scriptData가 변경될 때도 이 로직을 다시 실행하여 인덱스 유효성을 재검증할 수 있습니다.
  // 하지만 초기 로드 시에만 실행하려면 빈 배열을 사용합니다. 여기서는 초기 로드만 처리합니다.
  }, []); // 빈 배열: 마운트 시 1회 실행

  // --- 게임 저장 함수 ---
  const saveGame = useCallback(() => {
    try {
      // 저장할 데이터에 currentMissionId와 remainingAttempts 추가
      const dataToSave = {
        currentScriptIndex,
        gameFlags,
        currentEpisodeId,
        sceneProgress,
        currentMissionId,
        remainingAttempts
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      console.log('useGameState: 게임 저장 완료:', dataToSave);
      alert('게임이 저장되었습니다!');
    } catch (e) {
      console.error('useGameState: 게임 저장 실패:', e);
      alert('게임 저장에 실패했습니다.');
    }
  // 의존성 배열에 currentMissionId와 remainingAttempts 추가
  }, [currentScriptIndex, gameFlags, currentEpisodeId, sceneProgress, currentMissionId, remainingAttempts]);

  // --- 게임 불러오기 함수 ---
  const loadGame = useCallback(() => {
    console.log('useGameState: 게임 불러오기 시도...');
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // 불러온 인덱스가 유효한 숫자인지, 그리고 현재 로드된 스크립트 범위 내인지 확인
        if (typeof parsedData.currentScriptIndex === 'number' &&
            parsedData.currentScriptIndex >= 0 &&
            (scriptData.length === 0 || parsedData.currentScriptIndex < scriptData.length)) { // scriptData가 아직 로드되지 않았거나 범위 내일 때
          setCurrentScriptIndex(parsedData.currentScriptIndex);
          console.log('useGameState: 인덱스 불러오기 완료:', parsedData.currentScriptIndex);

          // gameFlags 불러오기 및 상태 업데이트
          if (typeof parsedData.gameFlags === 'object' && parsedData.gameFlags !== null) {
            setGameFlags(parsedData.gameFlags);
            console.log('useGameState: 플래그 불러오기 완료:', parsedData.gameFlags);
          } else {
            setGameFlags({}); // 저장된 플래그가 없거나 유효하지 않으면 초기화
            console.log('useGameState: 저장된 플래그 없음 또는 유효하지 않음, 플래그 초기화');
          }

          // currentEpisodeId 불러오기 및 상태 업데이트
          if (typeof parsedData.currentEpisodeId === 'string' || parsedData.currentEpisodeId === null) {
            setCurrentEpisodeId(parsedData.currentEpisodeId);
            console.log('useGameState: 에피소드 ID 불러오기 완료:', parsedData.currentEpisodeId);
          } else {
            setCurrentEpisodeId(null); // 유효하지 않으면 초기화
            console.log('useGameState: 저장된 에피소드 ID 없음 또는 유효하지 않음, 초기화');
          }

          // sceneProgress 불러오기 및 상태 업데이트
          if (typeof parsedData.sceneProgress === 'string') {
            setSceneProgress(parsedData.sceneProgress);
            console.log('useGameState: 씬 진행 상태 불러오기 완료:', parsedData.sceneProgress);
          } else {
            setSceneProgress('intro'); // 유효하지 않으면 초기화
            console.log('useGameState: 저장된 씬 진행 상태 없음 또는 유효하지 않음, 초기화');
          }

          // currentMissionId 불러오기 및 상태 업데이트
          if (typeof parsedData.currentMissionId === 'string' || parsedData.currentMissionId === null) {
            setCurrentMissionId(parsedData.currentMissionId);
            console.log('useGameState: 미션 ID 불러오기 완료:', parsedData.currentMissionId);
          } else {
            setCurrentMissionId(null);
            console.log('useGameState: 저장된 미션 ID 없음 또는 유효하지 않음, 초기화');
          }

          // remainingAttempts 불러오기 및 상태 업데이트
          if (typeof parsedData.remainingAttempts === 'number' && parsedData.remainingAttempts >= 0) {
            setRemainingAttempts(parsedData.remainingAttempts);
            console.log('useGameState: 남은 시도 횟수 불러오기 완료:', parsedData.remainingAttempts);
          } else {
            setRemainingAttempts(0); // 기본값 또는 미션 데이터 기반 초기값 설정 필요
            console.log('useGameState: 저장된 남은 시도 횟수 없음 또는 유효하지 않음, 초기화');
          }


          alert('게임을 불러왔습니다!');
        } else {
           console.warn('useGameState: 저장된 인덱스가 유효하지 않거나 스크립트 범위를 벗어납니다:', parsedData.currentScriptIndex);
           alert('유효하지 않은 저장 데이터입니다.');
        }
      } catch (e) {
        console.error('useGameState: 저장된 데이터 파싱 오류:', e);
        alert('저장된 데이터를 불러오는 데 실패했습니다.');
      }
    } else {
      console.log('useGameState: 저장된 데이터 없음');
      alert('저장된 게임 데이터가 없습니다.');
    }
  // scriptData가 변경될 때 함수가 재생성되도록 의존성 배열에 추가
  }, [scriptData]);

  return {
    currentScriptIndex,
    gameFlags,
    currentEpisodeId,
    sceneProgress,
    currentMissionId, // 반환 객체에 추가
    remainingAttempts, // 반환 객체에 추가
    setCurrentScriptIndex,
    setGameFlags,
    setCurrentEpisodeId,
    setSceneProgress,
    setCurrentMissionId, // 반환 객체에 추가
    setRemainingAttempts, // 반환 객체에 추가
    saveGame,
    loadGame
  };
};

export default useGameState;
