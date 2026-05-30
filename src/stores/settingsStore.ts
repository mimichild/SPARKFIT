import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS, DEFAULT_THEME_COLOR } from '@/constants';

type Theme = 'light' | 'dark' | 'auto';

interface SettingsState {
  theme: Theme;
  themeColor: string;
  height: number | null;
  targetWeight: number | null;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: string) => void;
  setHeight: (h: number | null) => void;
  setTargetWeight: (w: number | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'auto',
      themeColor: DEFAULT_THEME_COLOR,
      height: null,
      targetWeight: null,
      setTheme: (theme) => set({ theme }),
      setThemeColor: (themeColor) => set({ themeColor }),
      setHeight: (height) => set({ height }),
      setTargetWeight: (targetWeight) => set({ targetWeight }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
