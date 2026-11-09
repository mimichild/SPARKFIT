import type { SQLiteDatabase } from 'expo-sqlite';

/** 備份檔本身格式不對（不是 JSON、缺少 measurements）時丟出 */
export class BackupFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupFormatError';
  }
}

export interface BackupData {
  measurements: unknown[];
  settings?: {
    height?: number | null;
    shoulderWidth?: number | null;
    targetWeight?: number | null;
    themeColor?: string;
  };
}

export type ImportMode = 'merge' | 'overwrite';

// date 必須是第一個欄位；其餘順序需與 VALUES 參數一致
const COLUMNS = [
  'date', 'weight', 'chest', 'waist', 'low_waist', 'hip', 'thigh', 'arm',
  'bmi', 'bmr', 'body_fat_rate', 'body_fat_weight', 'muscle_weight', 'bone_weight',
  'visceral_fat', 'body_age', 'waist_hip_ratio', 'obesity_degree', 'recommended_calories',
  'calf', 'skeletal_muscle', 'underbust',
] as const;

const INSERT_SQL = `INSERT OR REPLACE INTO measurements (${COLUMNS.join(', ')})
  VALUES (${COLUMNS.map(() => '?').join(', ')})`;

export function parseBackup(content: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new BackupFormatError('not json');
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as BackupData).measurements)) {
    throw new BackupFormatError('missing measurements');
  }
  return parsed as BackupData;
}

/**
 * 將備份紀錄寫入資料庫。整個過程（含覆蓋模式的清除）包在同一個交易內，
 * 任何一步失敗都會整批復原，不會出現「舊資料已刪、新資料沒寫入」的狀況。
 */
export async function importMeasurements(
  db: SQLiteDatabase,
  records: unknown[],
  mode: ImportMode,
  onProgress?: (done: number, total: number) => void,
): Promise<{ imported: number; skipped: number }> {
  const valid = records.filter(
    (r): r is Record<string, unknown> =>
      !!r && typeof r === 'object' && typeof (r as { date?: unknown }).date === 'string'
      && (r as { date: string }).date.length > 0,
  );

  await db.withTransactionAsync(async () => {
    if (mode === 'overwrite') {
      await db.runAsync('DELETE FROM measurements');
    }
    for (let i = 0; i < valid.length; i++) {
      const m = valid[i];
      await db.runAsync(INSERT_SQL, COLUMNS.map(c => (m[c] ?? null) as string | number | null));
      onProgress?.(i + 1, valid.length);
    }
  });

  return { imported: valid.length, skipped: records.length - valid.length };
}

export function describeImportError(error: unknown): string {
  if (error instanceof BackupFormatError) return '請確認檔案格式是否正確';
  const detail = error instanceof Error ? error.message : String(error);
  return `寫入資料時發生錯誤，原本的資料沒有變動。\n\n錯誤內容：${detail}`;
}
