export function getContrastColor(hex: string): '#FFFFFF' | '#2D2D2D' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#2D2D2D' : '#FFFFFF';
}

export const Colors = {
  primary: '#EAAFB3',
  primaryLight: '#F5D4D6',
  primaryDark: '#D49094',
  primarySurface: '#FFF3F4',
  background: '#FFF9F9',
  cardBg: '#FFFFFF',
  textPrimary: '#2D2D2D',
  textSecondary: '#9A9A9A',
  textOnPrimary: '#FFFFFF',
  border: '#F0E2E3',
  shadow: '#EAAFB3',
} as const;
