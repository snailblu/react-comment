import { useState, useEffect, useCallback } from 'react';

const SAVE_KEY = 'saveDataVn'; // 로컬 스토리지 키 정의

/**
 * 게임 상태(스크립트 인덱스, 플래그) 및 저장/불러오기 로직을 관리하는 커스텀 Hook.
 * @param {Array} scriptData - 스크립트 데이터 배열 (불러오기 시 인덱스 유효성 검사에 사용).
 * @returns {{
 *   currentScriptIndex: number,
 *   gameFlags: object,
 *   setCurrentScriptIndex: Function,
 *   setGameFlags: Function,
 *   saveGame: Function,
 *   loadGame: Function
 * }} 게임 상태 값, 상태 업데이트 함수, 저장/불러오기 함수.
 */
const useGameState = (scriptData) => {
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [gameFlags, setGameFlags] = useState({});

  // --- 로컬 스토리지에서 초기 상태 로드 ---
  useEffect(() => {
    console.log('useGameState: 게임 상태 로드 시도...');
    const savedData = localStorage.getItem(SAVE_KEY);
    let loadedIndex = 0;
    let loadedFlags = {};

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
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
        } else {
          console.warn('useGameState: 저장된 currentScriptIndex가 유효하지 않습니다:', parsedData.currentScriptIndex);
        }
        // gameFlags 로드 및 유효성 검사
        if (typeof parsedData.gameFlags === 'object' && parsedData.gameFlags !== null) {
          loadedFlags = parsedData.gameFlags;
          console.log('useGameState: 저장된 플래그 로드:', loadedFlags);
        } else if (parsedData.gameFlags !== undefined) {
          console.warn('useGameState: 저장된 gameFlags가 유효한 객체가 아닙니다:', parsedData.gameFlags);
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

  // scriptData가 변경될 때도 이 로직을 다시 실행하여 인덱스 유효성을 재검증할 수 있습니다.
  // 하지만 초기 로드 시에만 실행하려면 빈 배열을 사용합니다. 여기서는 초기 로드만 처리합니다.
  }, []); // 빈 배열: 마운트 시 1회 실행

  // --- 게임 저장 함수 ---
  const saveGame = useCallback(() => {
    try {
      const dataToSave = { currentScriptIndex, gameFlags };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      console.log('useGameState: 게임 저장 완료:', dataToSave);
      alert('게임이 저장되었습니다!');
    } catch (e) {
      console.error('useGameState: 게임 저장 실패:', e);
      alert('게임 저장에 실패했습니다.');
    }
  // currentScriptIndex나 gameFlags가 변경될 때마다 함수가 재생성되지 않도록 useCallback 사용
  }, [currentScriptIndex, gameFlags]);

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
    setCurrentScriptIndex,
    setGameFlags,
    saveGame,
    loadGame
  };
};

export default useGameState;
