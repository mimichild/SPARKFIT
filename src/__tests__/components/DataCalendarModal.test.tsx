import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { DataCalendarModal } from '@/components/DataCalendarModal';

const mockDb = useSQLiteContext() as unknown as { getAllAsync: jest.Mock };

function setup() {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const screen = render(
    <DataCalendarModal
      visible
      selectedDate={new Date(2026, 9, 9)}
      themeColor="#E8A0A8"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { screen, onConfirm, onCancel };
}

describe('DataCalendarModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  it('does not cancel when tapping a non-button area inside the sheet', async () => {
    const { screen, onCancel } = setup();
    await waitFor(() => expect(mockDb.getAllAsync).toHaveBeenCalled());

    // 點月曆上方日期標題、底部按鈕列空白處，都不應該被當成「取消」
    fireEvent.press(screen.getByText('2026 年'));
    fireEvent.press(screen.getByTestId('calendar-footer'));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels when tapping the dimmed backdrop', async () => {
    const { screen, onCancel } = setup();
    await waitFor(() => expect(mockDb.getAllAsync).toHaveBeenCalled());

    fireEvent.press(screen.getByTestId('calendar-backdrop'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirm button has an enlarged touch area and returns the picked date', async () => {
    const { screen, onConfirm } = setup();
    await waitFor(() => expect(mockDb.getAllAsync).toHaveBeenCalled());

    const confirm = screen.getByTestId('calendar-confirm');
    expect(confirm.props.hitSlop).toBeTruthy();
    fireEvent.press(confirm);

    expect(onConfirm).toHaveBeenCalledWith(new Date(2026, 9, 9));
  });
});
