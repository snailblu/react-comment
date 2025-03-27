import React, { createContext, useState, useEffect, useCallback } from 'react';
import { setAudioManagerBgmVolume, setAudioManagerSfxVolume } from '../utils/audioManager';

// 1. Context 생성 및 export
export const SettingsContext = createContext();

// 2. SettingsProvider 컴포넌트 정의 및 export
export const SettingsProvider = ({ children }) => {
  // 2a. useState로 볼륨 상태 관리
  const [bgmVolume, setBgmVolumeState] = useState(0.5); // BGM 초기 볼륨
  const [sfxVolume, setSfxVolumeState] = useState(0.8); // SFX 초기 볼륨

  // 2b. 볼륨 상태 업데이트 함수 (useCallback으로 감싸거나 직접 setter 전달)
  // 여기서는 직접 setter를 전달하는 대신, audioManager 연동을 위해 별도 함수 정의
  const setBgmVolume = useCallback((volume) => {
    const newVolume = Math.max(0, Math.min(1, Number(volume))); // 숫자 변환 및 범위 제한
    setBgmVolumeState(newVolume);
  }, []);

  const setSfxVolume = useCallback((volume) => {
    const newVolume = Math.max(0, Math.min(1, Number(volume))); // 숫자 변환 및 범위 제한
    setSfxVolumeState(newVolume);
  }, []);

  // 2c. useEffect를 사용하여 상태 변경 시 audioManager 함수 호출
  useEffect(() => {
    console.log(`SettingsContext: bgmVolume changed to ${bgmVolume}, updating audioManager.`);
    setAudioManagerBgmVolume(bgmVolume);
  }, [bgmVolume]); // bgmVolume이 변경될 때마다 실행

  useEffect(() => {
    console.log(`SettingsContext: sfxVolume changed to ${sfxVolume}, updating audioManager.`);
    setAudioManagerSfxVolume(sfxVolume);
  }, [sfxVolume]); // sfxVolume이 변경될 때마다 실행

  // 2d. Provider로 값 전달
  const value = {
    bgmVolume,
    setBgmVolume,
    sfxVolume,
    setSfxVolume,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
