export const DB_NAME = 'sparkfit.db';

export const STORAGE_KEYS = {
  SETTINGS: 'sparkfit-settings',
} as const;

export const PHOTO_SIZES = {
  THUMB: { maxSize: 120, quality: 0.8 },
  GRID: { maxSize: 400, quality: 0.85 },
  DETAIL: { maxSize: 800, quality: 0.9 },
  BACKUP_LITE: { maxSize: 600, quality: 0.6 },
} as const;

export const DEFAULT_THEME_COLOR = '#EAAFB3';

export const THEME_COLORS = [
  { label: '黑色',   value: '#1A1A1A' },
  { label: '玫瑰粉', value: '#EAAFB3' },
  { label: '卡其',   value: '#C4AA82' },
  { label: '天藍',   value: '#87C4DC' },
  { label: '酒紅',   value: '#A03050' },
  { label: '薄荷綠', value: '#A8D5B5' },
  { label: '薰衣草', value: '#C5AEE0' },
  { label: '蜜桃橘', value: '#F2C38F' },
  { label: '奶油黃', value: '#F5E07A' },
  { label: '湖水藍', value: '#89C4BE' },
] as const;
