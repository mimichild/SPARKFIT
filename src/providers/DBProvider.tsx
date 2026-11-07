import { type ReactNode } from 'react';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import { DB_NAME } from '@/constants';

// 初版之後才新增的欄位（只能往後加，不要改名或刪除）
const ADDED_COLUMNS = ['calf', 'skeletal_muscle', 'underbust'] as const;

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
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
      calf                REAL,
      skeletal_muscle     REAL,
      underbust           REAL,
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

  // 舊版資料表缺少的欄位逐一補上（小腿圍、骨骼肌量、下胸圍）；既有資料不受影響
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(measurements)');
  const existing = new Set(columns.map(c => c.name));
  for (const col of ADDED_COLUMNS) {
    if (!existing.has(col)) {
      await db.execAsync(`ALTER TABLE measurements ADD COLUMN ${col} REAL`);
    }
  }
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
