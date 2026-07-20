jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useSettingsStore } from '@/stores/settingsStore';
import { DEFAULT_THEME_COLOR } from '@/constants';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'auto',
      themeColor: DEFAULT_THEME_COLOR,
      height: null,
      shoulderWidth: null,
      targetWeight: null,
    });
  });

  it('defaults to the auto theme and no measurements set', () => {
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('auto');
    expect(s.themeColor).toBe(DEFAULT_THEME_COLOR);
    expect(s.height).toBeNull();
    expect(s.shoulderWidth).toBeNull();
    expect(s.targetWeight).toBeNull();
  });

  it('setTheme updates theme', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('setThemeColor updates themeColor', () => {
    useSettingsStore.getState().setThemeColor('#123456');
    expect(useSettingsStore.getState().themeColor).toBe('#123456');
  });

  it('setHeight updates height', () => {
    useSettingsStore.getState().setHeight(170);
    expect(useSettingsStore.getState().height).toBe(170);
  });

  it('setHeight can clear height back to null', () => {
    useSettingsStore.getState().setHeight(170);
    useSettingsStore.getState().setHeight(null);
    expect(useSettingsStore.getState().height).toBeNull();
  });

  it('setShoulderWidth updates shoulderWidth', () => {
    useSettingsStore.getState().setShoulderWidth(38);
    expect(useSettingsStore.getState().shoulderWidth).toBe(38);
  });

  it('setTargetWeight updates targetWeight', () => {
    useSettingsStore.getState().setTargetWeight(60);
    expect(useSettingsStore.getState().targetWeight).toBe(60);
  });

  it('setters do not affect unrelated fields', () => {
    useSettingsStore.getState().setHeight(170);
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('auto');
    expect(s.shoulderWidth).toBeNull();
    expect(s.targetWeight).toBeNull();
  });
});
