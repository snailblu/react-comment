import { create } from "zustand";
import { Settings } from "../types"; // Assuming Settings type is defined in src/types
import {
  setAudioManagerBgmVolume,
  setAudioManagerSfxVolume,
} from "../utils/audioManager"; // Import audio manager functions

// Define the state interface based on the Settings type
interface SettingsState extends Settings {}

// Define actions to update settings
interface SettingsActions {
  setMasterVolume: (volume: number) => void;
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setTextSize: (size: number) => void;
  setTextSpeed: (speed: number) => void;
  setAutoPlaySpeed: (speed: number) => void;
  setLanguage: (language: string) => void;
  // Action to update multiple settings at once
  updateSettings: (newSettings: Partial<Settings>) => void;
}

// Default settings values (consider loading from localStorage later)
const defaultSettings: Settings = {
  masterVolume: 1,
  bgmVolume: 0.8,
  sfxVolume: 0.8,
  textSize: 16,
  textSpeed: 50,
  autoPlaySpeed: 1000,
  language: "ko", // Default language
};

export const useSettingsStore = create<SettingsState & SettingsActions>(
  (set) => ({
    ...defaultSettings, // Initialize with default settings

    setMasterVolume: (volume) => set({ masterVolume: volume }), // TODO: Add audioManager call if master volume affects it
    setBgmVolume: (volume) => {
      const newVolume = Math.max(0, Math.min(1, volume));
      set({ bgmVolume: newVolume });
      console.log(
        `settingsStore: bgmVolume changed to ${newVolume}, updating audioManager.`
      );
      setAudioManagerBgmVolume(newVolume); // Call audio manager
    },
    setSfxVolume: (volume) => {
      const newVolume = Math.max(0, Math.min(1, volume));
      set({ sfxVolume: newVolume });
      console.log(
        `settingsStore: sfxVolume changed to ${newVolume}, updating audioManager.`
      );
      setAudioManagerSfxVolume(newVolume); // Call audio manager
    },
    setTextSize: (size) => set({ textSize: size }),
    setTextSpeed: (speed) => set({ textSpeed: speed }),
    setAutoPlaySpeed: (speed) => set({ autoPlaySpeed: speed }),
    setLanguage: (language) => set({ language: language }),
    updateSettings: (newSettings) =>
      set((state) => ({ ...state, ...newSettings })),
  })
);
