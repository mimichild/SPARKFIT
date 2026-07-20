import { toDateKey, formatDate, WEEKDAYS } from '@/utils/date';

describe('toDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 6, 20))).toBe('2026-07-20');
  });

  it('pads single-digit month and day with a leading zero', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('does not pad double-digit month and day', () => {
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('formatDate', () => {
  it('formats a Monday with the correct weekday label', () => {
    // 2026-07-20 is a Monday (verified against app screenshot evidence).
    expect(formatDate(new Date(2026, 6, 20))).toBe('2026 年 7 月 20 日（一）');
  });

  it('formats a Sunday with the correct weekday label', () => {
    expect(formatDate(new Date(2026, 6, 19))).toBe('2026 年 7 月 19 日（日）');
  });

  it('uses all 7 entries of WEEKDAYS across a full week', () => {
    const labels = Array.from({ length: 7 }, (_, i) =>
      formatDate(new Date(2026, 6, 19 + i)).slice(-2, -1),
    );
    expect(labels).toEqual(WEEKDAYS);
  });
});
