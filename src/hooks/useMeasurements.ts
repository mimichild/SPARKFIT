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

export function useMeasurements() {
  const db = useDBContext();

  const getMeasurement = useCallback(
    async (date: string): Promise<Measurement | null> => {
      const result = await db.getFirstAsync<Measurement>(
        'SELECT * FROM measurements WHERE date = ?',
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

  return { getMeasurement, saveMeasurement };
}
