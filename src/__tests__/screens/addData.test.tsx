jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
import { Alert } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import AddDataScreen from '../../../app/add-data';
import { useSettingsStore } from '@/stores/settingsStore';

const mockParams: { mode: 'add' | 'edit'; date: string } = { mode: 'add', date: '2026-11-07' };
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  router: { back: jest.fn() },
}));

const mockDb = useSQLiteContext() as unknown as {
  getFirstAsync: jest.Mock;
  runAsync: jest.Mock;
};

const EXISTING = {
  date: '2026-11-07',
  weight: 62, chest: null, waist: 70, low_waist: null, hip: 92,
  thigh: null, calf: null, arm: null, bmi: 22.8, bmr: null, body_fat_rate: 25,
  body_fat_weight: null, muscle_weight: 40, bone_weight: 2.5,
  visceral_fat: null, body_age: 30, waist_hip_ratio: 0.76,
  obesity_degree: null, recommended_calories: null,
};

// 存進資料庫的參數順序（見 useMeasurements.saveMeasurement）
const COLS = ['date', 'weight', 'chest', 'waist', 'low_waist', 'hip', 'thigh', 'arm',
  'bmi', 'bmr', 'body_fat_rate', 'body_fat_weight', 'muscle_weight', 'bone_weight',
  'visceral_fat', 'body_age', 'waist_hip_ratio', 'obesity_degree', 'recommended_calories', 'calf'];

function savedRow(): Record<string, unknown> {
  const params = mockDb.runAsync.mock.calls[0][1] as unknown[];
  return Object.fromEntries(COLS.map((c, i) => [c, params[i]]));
}

type AlertButton = { text: string; onPress?: () => void };
function pressAlertButton(text: string) {
  const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as AlertButton[];
  act(() => { buttons.find(b => b.text === text)!.onPress!(); });
}

describe('AddDataScreen save flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockParams.mode = 'add';
    useSettingsStore.setState({ height: 165, shoulderWidth: null, targetWeight: null });
  });

  it('saves directly without asking when the day has no record', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('field-體重'), '60');
    fireEvent.changeText(screen.getByTestId('field-腰圍'), '70');
    fireEvent.changeText(screen.getByTestId('field-臀圍'), '92');
    fireEvent.press(screen.getByTestId('save-btn'));

    await waitFor(() => expect(mockDb.runAsync).toHaveBeenCalled());
    expect(Alert.alert).not.toHaveBeenCalled();
    const row = savedRow();
    expect(row.weight).toBe(60);
    expect(row.bmi).toBe(22);              // 60 / 1.65^2
    expect(row.waist_hip_ratio).toBe(0.76); // 自動算出的腰臀比要存進資料庫
  });

  it('asks before overwriting; "是" overwrites filled fields and keeps blank ones', async () => {
    mockDb.getFirstAsync.mockResolvedValue(EXISTING);
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('field-體重'), '61.5');
    fireEvent.changeText(screen.getByTestId('field-小腿圍'), '34');
    fireEvent.press(screen.getByTestId('save-btn'));

    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    expect(mockDb.runAsync).not.toHaveBeenCalled();
    expect((Alert.alert as jest.Mock).mock.calls[0][0]).toBe('已有填寫資料');

    pressAlertButton('是');
    await waitFor(() => expect(mockDb.runAsync).toHaveBeenCalled());
    const row = savedRow();
    expect(row.weight).toBe(61.5);
    expect(row.calf).toBe(34);
    expect(row.waist).toBe(70);          // 沒填 → 保留舊值
    expect(row.body_fat_rate).toBe(25);
    expect(row.muscle_weight).toBe(40);  // 隱藏欄位保留
    expect(row.body_age).toBe(30);
    expect(row.waist_hip_ratio).toBe(0.76);
  });

  it('"否" shows the differences and saves the value the user picked', async () => {
    mockDb.getFirstAsync.mockResolvedValue(EXISTING);
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('field-體重'), '61.5');
    fireEvent.changeText(screen.getByTestId('field-腰圍'), '72');
    fireEvent.press(screen.getByTestId('save-btn'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

    pressAlertButton('否');
    expect(mockDb.runAsync).not.toHaveBeenCalled();
    expect(screen.getByTestId('conflict-weight')).toBeTruthy();
    expect(screen.getByTestId('conflict-waist')).toBeTruthy();
    expect(screen.queryByTestId('conflict-body_fat_rate')).toBeNull();

    fireEvent.press(screen.getByTestId('conflict-weight-old')); // 體重保留舊的 62
    fireEvent.press(screen.getByTestId('save-btn'));

    await waitFor(() => expect(mockDb.runAsync).toHaveBeenCalled());
    expect(Alert.alert).toHaveBeenCalledTimes(1); // 不會再問一次
    const row = savedRow();
    expect(row.weight).toBe(62);
    expect(row.waist).toBe(72);
    expect(row.waist_hip_ratio).toBe(0.78); // 舊的是自動值 → 用新腰圍重算 72/92
    expect(row.body_fat_rate).toBe(25);
  });

  it('edit mode leaves an auto-computed ratio out of the input so it follows waist/hip', async () => {
    mockParams.mode = 'edit';
    mockDb.getFirstAsync.mockResolvedValue(EXISTING);
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(screen.getByTestId('field-體重').props.value).toBe('62'));

    expect(screen.getByTestId('field-腰臀比').props.value).toBe('');
    fireEvent.changeText(screen.getByTestId('field-腰圍'), '72');
    fireEvent.press(screen.getByTestId('save-btn'));

    await waitFor(() => expect(mockDb.runAsync).toHaveBeenCalled());
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(savedRow().waist_hip_ratio).toBe(0.78);
    expect(savedRow().muscle_weight).toBe(40);
  });

  it('"否" keeps the new values even when height was changed in the same form', async () => {
    mockDb.getFirstAsync.mockResolvedValue(EXISTING);
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('field-身高'), '170');
    fireEvent.changeText(screen.getByTestId('field-體重'), '61.5');
    fireEvent.press(screen.getByTestId('save-btn'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

    pressAlertButton('否');
    // 選「否」時還沒存檔，身高也不該先寫進設定
    expect(useSettingsStore.getState().height).toBe(165);
    await waitFor(() => expect(screen.getByTestId('field-體重').props.value).toBe('61.5'));

    fireEvent.press(screen.getByTestId('save-btn'));
    await waitFor(() => expect(mockDb.runAsync).toHaveBeenCalled());
    expect(savedRow().weight).toBe(61.5);
    expect(useSettingsStore.getState().height).toBe(170);
  });

  it('ignores save until the existing record has loaded', async () => {
    let resolveLoad: (v: unknown) => void = () => {};
    mockDb.getFirstAsync.mockReturnValue(new Promise(r => { resolveLoad = r; }));
    const screen = render(<AddDataScreen />);

    fireEvent.changeText(screen.getByTestId('field-體重'), '61.5');
    fireEvent.press(screen.getByTestId('save-btn'));
    expect(mockDb.runAsync).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();

    await act(async () => { resolveLoad(EXISTING); });
  });

  it('picking "舊" for an auto-computed ratio keeps it auto (recomputed from new waist)', async () => {
    mockDb.getFirstAsync.mockResolvedValue(EXISTING); // 0.76 = 70/92，自動值
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('field-腰圍'), '72');
    fireEvent.changeText(screen.getByTestId('field-腰臀比'), '0.9');
    fireEvent.press(screen.getByTestId('save-btn'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    pressAlertButton('否');

    fireEvent.press(screen.getByTestId('conflict-waist_hip_ratio-old'));
    expect(screen.getByTestId('field-腰臀比').props.value).toBe('');
    fireEvent.press(screen.getByTestId('save-btn'));

    await waitFor(() => expect(mockDb.runAsync).toHaveBeenCalled());
    expect(savedRow().waist_hip_ratio).toBe(0.78); // 72/92，不是寫死的 0.76
  });

  it('shows "_" as the empty placeholder instead of a dash', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const screen = render(<AddDataScreen />);
    await waitFor(() => expect(mockDb.getFirstAsync).toHaveBeenCalled());

    expect(screen.getByTestId('field-體脂肪量').props.placeholder).toBe('_');
    expect(screen.getByTestId('auto-去脂體重').props.children).toBe('_');
  });
});
