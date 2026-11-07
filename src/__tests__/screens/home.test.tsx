jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: () => {},
}));

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import DataScreen from '../../../app/(tabs)/index';
import { useSettingsStore } from '@/stores/settingsStore';
import { METRIC_INFO } from '@/constants/metricInfo';

const mockDb = useSQLiteContext() as unknown as { getFirstAsync: jest.Mock };

describe('DataScreen metric info', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ height: 165 });
    mockDb.getFirstAsync.mockResolvedValue({
      date: '2026-11-07', weight: 60, waist: 70, hip: 92, body_fat_weight: 15,
      skeletal_muscle: 22.5, underbust: 70,
    });
  });

  it('shows a (?) next to every metric name, including weight', async () => {
    const screen = render(<DataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    for (const label of ['目前體重', '骨骼肌量', '腰高比', 'FFMI', '胸圍', '下胸圍', '小腿圍']) {
      expect(screen.getByTestId(`info-${label}`)).toBeTruthy();
    }
  });

  it('opens an explanation when (?) is pressed and closes it', async () => {
    const screen = render(<DataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    fireEvent.press(screen.getByTestId('info-腰高比'));
    expect(screen.getByText(METRIC_INFO.waist_height_ratio.description)).toBeTruthy();

    fireEvent.press(screen.getByTestId('metric-info-close'));
    expect(screen.queryByText(METRIC_INFO.waist_height_ratio.description)).toBeNull();
  });

  it('shows computed waist-to-height ratio and FFMI values', async () => {
    const screen = render(<DataScreen />);
    await waitFor(() => expect(screen.getByText('0.42')).toBeTruthy()); // 70/165
    expect(screen.getByText('16.5')).toBeTruthy(); // 45/1.65^2
    expect(screen.getByText('22.5')).toBeTruthy(); // 骨骼肌量
  });
});
