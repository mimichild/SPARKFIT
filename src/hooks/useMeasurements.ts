import { useCallback } from 'react';
import { useDBContext } from '@/providers/DBProvider';

export type Measurement = {
  date: string;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  low_waist: number | null;
  hip: number | null;
  thigh: number | null;
  arm: number | null;
  bmi: number | null;
  bmr: number | null;
  body_fat_rate: number | null;
  body_fat_weight: number | null;
  muscle_weight: number | null;
  bone_weight: number | null;
  visceral_fat: number | null;
  body_age: number | null;
  waist_hip_ratio: number | null;
  obesity_degree: number | null;
  recommended_calories: number | null;
};

const HAS_DATA_CONDITION = `(
  weight IS NOT NULL OR chest IS NOT NULL OR waist IS NOT NULL OR low_waist IS NOT NULL OR
  hip IS NOT NULL OR thigh IS NOT NULL OR arm IS NOT NULL OR bmi IS NOT NULL OR
  bmr IS NOT NULL OR body_fat_rate IS NOT NULL OR body_fat_weight IS NOT NULL OR
  muscle_weight IS NOT NULL OR bone_weight IS NOT NULL OR visceral_fat IS NOT NULL OR
  body_age IS NOT NULL OR waist_hip_ratio IS NOT NULL OR obesity_degree IS NOT NULL OR
  recommended_calories IS NOT NULL
)`;

export function useMeasurements() {
  const db = useDBContext();

  const getMeasurement = useCallback(
    async (date: string): Promise<Measurement | null> => {
      const result = await db.getFirstAsync<Measurement>(
        `SELECT * FROM measurements WHERE date = ? AND ${HAS_DATA_CONDITION}`,
        [date],
      );
      return result ?? null;
    },
    [db],
  );

  const saveMeasurement = useCallback(
    async (m: Measurement): Promise<void> => {
      await db.runAsync(
        `INSERT OR REPLACE INTO measurements
          (date, weight, chest, waist, low_waist, hip, thigh, arm,
           bmi, bmr, body_fat_rate, body_fat_weight, muscle_weight, bone_weight,
           visceral_fat, body_age, waist_hip_ratio, obesity_degree, recommended_calories)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.date, m.weight, m.chest, m.waist, m.low_waist, m.hip, m.thigh, m.arm,
          m.bmi, m.bmr, m.body_fat_rate, m.body_fat_weight, m.muscle_weight,
          m.bone_weight, m.visceral_fat, m.body_age, m.waist_hip_ratio,
          m.obesity_degree, m.recommended_calories,
        ],
      );
    },
    [db],
  );

  const getMeasurements = useCallback(
    async (startDate: string, endDate: string): Promise<Measurement[]> => {
      const results = await db.getAllAsync<Measurement>(
        `SELECT * FROM measurements WHERE date >= ? AND date <= ? AND ${HAS_DATA_CONDITION} ORDER BY date ASC`,
        [startDate, endDate],
      );
      return results;
    },
    [db],
  );

  const getLatestMeasurement = useCallback(async (beforeDate?: string): Promise<Measurement | null> => {
    const result = beforeDate
      ? await db.getFirstAsync<Measurement>(
          `SELECT * FROM measurements WHERE date < ? AND ${HAS_DATA_CONDITION} ORDER BY date DESC LIMIT 1`,
          [beforeDate],
        )
      : await db.getFirstAsync<Measurement>(
          `SELECT * FROM measurements WHERE ${HAS_DATA_CONDITION} ORDER BY date DESC LIMIT 1`,
        );
    return result ?? null;
  }, [db]);

  return { getMeasurement, getMeasurements, getLatestMeasurement, saveMeasurement };
}
