import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { useMeasurements } from '@/hooks/useMeasurements';
import { WEEKDAYS, toDateKey } from '@/utils/date';

type Props = {
  visible: boolean;
  selectedDate: Date;
  themeColor: string;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

type DayMarking = {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
};

function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getMonthRange(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split('-').map(Number);
  const start = `${monthKey}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${monthKey}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function DataCalendarModal({ visible, selectedDate, themeColor, onConfirm, onCancel }: Props) {
  const [tempDate, setTempDate] = useState(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(toMonthKey(selectedDate));
  const [markedDays, setMarkedDays] = useState<string[]>([]);

  const { getMeasurements } = useMeasurements();

  useEffect(() => {
    if (visible) {
      setTempDate(selectedDate);
      setVisibleMonth(toMonthKey(selectedDate));
    }
  }, [visible, selectedDate]);

  const loadMarkedDays = useCallback(async (monthKey: string) => {
    const { start, end } = getMonthRange(monthKey);
    const records = await getMeasurements(start, end);
    setMarkedDays(records.map((r) => r.date));
  }, [getMeasurements]);

  useEffect(() => {
    if (visible) {
      loadMarkedDays(visibleMonth);
    }
  }, [visible, visibleMonth, loadMarkedDays]);

  if (!visible) return null;

  const tempDateKey = toDateKey(tempDate);
  const markedDates: Record<string, DayMarking> = {};
  markedDays.forEach((dateKey) => {
    markedDates[dateKey] = { marked: true, dotColor: themeColor };
  });
  markedDates[tempDateKey] = {
    ...(markedDates[tempDateKey] ?? {}),
    selected: true,
    selectedColor: themeColor,
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={styles.sheet}>
          <View style={[styles.header, { backgroundColor: themeColor }]}>
            <Text style={styles.headerYear}>{tempDate.getFullYear()} 年</Text>
            <Text style={styles.headerDate}>
              {tempDate.getMonth() + 1} 月 {tempDate.getDate()} 日 週{WEEKDAYS[tempDate.getDay()]}
            </Text>
          </View>

          <Calendar
            current={`${visibleMonth}-01`}
            markedDates={markedDates}
            onDayPress={(day: DateData) => setTempDate(fromDateKey(day.dateString))}
            onMonthChange={(month: DateData) =>
              setVisibleMonth(`${month.year}-${String(month.month).padStart(2, '0')}`)
            }
            firstDay={0}
            theme={{
              todayTextColor: themeColor,
              selectedDayBackgroundColor: themeColor,
              selectedDayTextColor: '#FFFFFF',
              arrowColor: themeColor,
              monthTextColor: themeColor,
              dotColor: themeColor,
              selectedDotColor: '#FFFFFF',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={[styles.confirmText, { color: themeColor }]}>確定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerYear: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.85,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 15,
    color: '#999999',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
