import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS, DEFAULT_THEME_COLOR } from '@/constants';

type Theme = 'light' | 'dark' | 'auto';

interface SettingsState {
  theme: Theme;
  themeColor: string;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'auto',
      themeColor: DEFAULT_THEME_COLOR,
      setTheme: (theme) => set({ theme }),
      setThemeColor: (themeColor) => set({ themeColor }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
