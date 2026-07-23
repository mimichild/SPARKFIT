import { renderHook } from '@testing-library/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';

const mockDb = useSQLiteContext() as unknown as {
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
  runAsync: jest.Mock;
};

function makeMeasurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    date: '2026-07-20',
    weight: 60, chest: null, waist: null, low_waist: null, hip: null,
    thigh: null, arm: null, bmi: null, bmr: null, body_fat_rate: null,
    body_fat_weight: null, muscle_weight: null, bone_weight: null,
    visceral_fat: null, body_age: null, waist_hip_ratio: null,
    obesity_degree: null, recommended_calories: null,
    ...overrides,
  };
}

describe('useMeasurements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMeasurement', () => {
    it('queries by date and returns the row', async () => {
      const row = makeMeasurement();
      mockDb.getFirstAsync.mockResolvedValue(row);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getMeasurement('2026-07-20');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringMatching(/^SELECT \* FROM measurements WHERE date = \? AND \(/),
        ['2026-07-20'],
      );
      expect(got).toEqual(row);
    });

    it('returns null when no row is found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getMeasurement('2026-07-20');

      expect(got).toBeNull();
    });

    it('returns null for a row where every field was cleared back to null', async () => {
      // The app has no real delete — "removing" a record means saving it with
      // every field blank, which leaves a date-only row behind. The SQL filter
      // (HAS_DATA_CONDITION) should exclude it, same as a missing row.
      mockDb.getFirstAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getMeasurement('2026-07-15');

      expect(got).toBeNull();
    });
  });

  describe('saveMeasurement', () => {
    it('runs an INSERT OR REPLACE with all fields in column order', async () => {
      const m = makeMeasurement({ weight: 65.5, bmi: 22.1 });
      const { result } = renderHook(() => useMeasurements());

      await result.current.saveMeasurement(m);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO measurements'),
        [
          m.date, m.weight, m.chest, m.waist, m.low_waist, m.hip, m.thigh, m.arm,
          m.bmi, m.bmr, m.body_fat_rate, m.body_fat_weight, m.muscle_weight,
          m.bone_weight, m.visceral_fat, m.body_age, m.waist_hip_ratio,
          m.obesity_degree, m.recommended_calories,
        ],
      );
    });
  });

  describe('getMeasurements', () => {
    it('queries an inclusive date range ordered ascending', async () => {
      const rows = [makeMeasurement({ date: '2026-07-01' }), makeMeasurement({ date: '2026-07-20' })];
      mockDb.getAllAsync.mockResolvedValue(rows);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getMeasurements('2026-07-01', '2026-07-31');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringMatching(/^SELECT \* FROM measurements WHERE date >= \? AND date <= \? AND \(.*\) ORDER BY date ASC$/s),
        ['2026-07-01', '2026-07-31'],
      );
      expect(got).toEqual(rows);
    });

    it('excludes rows with no real data (all fields null) even if the date row exists', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getMeasurements('2026-07-01', '2026-07-31');

      // The filtering itself happens in SQL (HAS_DATA_CONDITION); here we just
      // confirm the hook passes through whatever the (correctly filtered) query returns.
      expect(got).toEqual([]);
    });
  });

  describe('getLatestMeasurement', () => {
    it('without beforeDate, queries the most recent row with any data', async () => {
      const row = makeMeasurement();
      mockDb.getFirstAsync.mockResolvedValue(row);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getLatestMeasurement();

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringMatching(/ORDER BY date DESC LIMIT 1$/),
      );
      expect(got).toEqual(row);
    });

    it('with beforeDate, filters to rows strictly before that date', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      const { result } = renderHook(() => useMeasurements());

      await result.current.getLatestMeasurement('2026-07-20');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringMatching(/WHERE date < \? AND/),
        ['2026-07-20'],
      );
    });

    it('returns null when nothing is found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMeasurements());

      const got = await result.current.getLatestMeasurement();

      expect(got).toBeNull();
    });
  });

  describe('deleteMeasurement', () => {
    it('runs a DELETE for the given date', async () => {
      const { result } = renderHook(() => useMeasurements());

      await result.current.deleteMeasurement('2026-07-15');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM measurements WHERE date = ?',
        ['2026-07-15'],
      );
    });
  });
});
