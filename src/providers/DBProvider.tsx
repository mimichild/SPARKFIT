import { type ReactNode } from 'react';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import { DB_NAME } from '@/constants';

async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS measurements (
      date                TEXT PRIMARY KEY,
      weight              REAL,
      chest               REAL,
      waist               REAL,
      low_waist           REAL,
      hip                 REAL,
      thigh               REAL,
      arm                 REAL,
      bmi                 REAL,
      bmr                 REAL,
      body_fat_rate       REAL,
      body_fat_weight     REAL,
      muscle_weight       REAL,
      bone_weight         REAL,
      visceral_fat        REAL,
      body_age            REAL,
      waist_hip_ratio     REAL,
      obesity_degree      REAL,
      recommended_calories REAL
    );
  `);
}

export function DBProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
      {children}
    </SQLiteProvider>
  );
}

export function useDBContext(): SQLiteDatabase {
  return useSQLiteContext();
}
