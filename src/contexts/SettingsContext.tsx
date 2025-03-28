import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react'; // Combined imports, added ReactNode
import { setAudioManagerBgmVolume, setAudioManagerSfxVolume } from '../utils/audioManager';

// 컨텍스트 값의 타입을 정의하는 인터페이스 (export 추가)
export interface SettingsContextType {
  bgmVolume: number;
  setBgmVolume: (volume: number) => void;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
}

// 1. Context 생성 및 export (기본값 제공)
export const SettingsContext = createContext<SettingsContextType>({
  bgmVolume: 0.5,
  setBgmVolume: () => {}, // 기본 함수 제공
  sfxVolume: 0.8,
  setSfxVolume: () => {}, // 기본 함수 제공
});

// Provider Props 타입 정의
interface SettingsProviderProps {
  children: ReactNode; // children 타입 지정
}

// 2. SettingsProvider 컴포넌트 정의 및 export
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // 2a. useState로 볼륨 상태 관리
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.5); // BGM 초기 볼륨 (타입 명시)
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.8); // SFX 초기 볼륨 (타입 명시)

  // 2b. 볼륨 상태 업데이트 함수 (useCallback으로 감싸거나 직접 setter 전달)
  // 여기서는 직접 setter를 전달하는 대신, audioManager 연동을 위해 별도 함수 정의
  const setBgmVolume = useCallback((volume: number) => { // volume 타입 number로 지정
    const newVolume = Math.max(0, Math.min(1, volume)); // Number() 불필요, 범위 제한
    setBgmVolumeState(newVolume);
  }, []);

  const setSfxVolume = useCallback((volume: number) => { // volume 타입 number로 지정
    const newVolume = Math.max(0, Math.min(1, volume)); // Number() 불필요, 범위 제한
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

  // 2d. Provider로 값 전달 (타입 명시)
  const value: SettingsContextType = {
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
