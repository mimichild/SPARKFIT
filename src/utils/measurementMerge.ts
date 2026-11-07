import type { Measurement } from '@/hooks/useMeasurements';
import { calcWaistHipRatio } from '@/utils/bodyMetrics';

/** 新增數據頁上「每天記錄」的欄位（不含身高等基本資料、不含已隱藏的舊欄位）。 */
export const DAILY_FIELDS = [
  { key: 'weight',          label: '體重',         unit: 'kg'   },
  { key: 'skeletal_muscle', label: '骨骼肌量',     unit: 'kg'   },
  { key: 'body_fat_rate',   label: '體脂率',       unit: '%'    },
  { key: 'visceral_fat',    label: '內臟脂肪等級', unit: ''     },
  { key: 'waist_hip_ratio', label: '腰臀比',       unit: ''     },
  { key: 'body_fat_weight', label: '體脂肪量',     unit: 'kg'   },
  { key: 'bmr',             label: '基礎代謝率',   unit: 'kcal' },
  { key: 'chest',           label: '胸圍',         unit: 'cm'   },
  { key: 'underbust',       label: '下胸圍',       unit: 'cm'   },
  { key: 'waist',           label: '腰圍',         unit: 'cm'   },
  { key: 'low_waist',       label: '低腰圍',       unit: 'cm'   },
  { key: 'hip',             label: '臀圍',         unit: 'cm'   },
  { key: 'thigh',           label: '大腿圍',       unit: 'cm'   },
  { key: 'calf',            label: '小腿圍',       unit: 'cm'   },
  { key: 'arm',             label: '手臂圍',       unit: 'cm'   },
] as const satisfies readonly { key: keyof Measurement; label: string; unit: string }[];

export type DailyFieldKey = (typeof DAILY_FIELDS)[number]['key'];

export type DiffRow = {
  key: DailyFieldKey;
  label: string;
  unit: string;
  oldValue: number;
  newValue: number;
};

/** 新舊都有填、而且數字不同的欄位。 */
export function diffWithExisting(existing: Measurement, entered: Measurement): DiffRow[] {
  const rows: DiffRow[] = [];
  for (const { key, label, unit } of DAILY_FIELDS) {
    const oldValue = existing[key];
    const newValue = entered[key];
    if (oldValue != null && newValue != null && oldValue !== newValue) {
      rows.push({ key, label, unit, oldValue, newValue });
    }
  }
  return rows;
}

/** 有填的欄位覆蓋舊值，沒填的保留舊值；隱藏欄位一律沿用舊值。 */
export function mergeIntoExisting(existing: Measurement, entered: Measurement): Measurement {
  const merged: Measurement = { ...existing, date: entered.date };
  for (const { key } of DAILY_FIELDS) {
    if (entered[key] != null) merged[key] = entered[key];
  }
  return merged;
}

/** 存的腰臀比是不是由腰圍/臀圍自動算出來的。 */
export function isAutoWaistHipRatio(m: Measurement): boolean {
  if (m.waist_hip_ratio == null) return false;
  return calcWaistHipRatio(m.waist, m.hip) === m.waist_hip_ratio;
}

/**
 * 要存進資料庫的腰臀比：
 * 手填優先 → 合併時舊資料若是手填的就保留 → 否則用腰圍/臀圍自動計算。
 */
export function finalWaistHipRatio(
  manual: number | null,
  existing: Measurement | null,
  waist: number | null,
  hip: number | null,
): number | null {
  if (manual != null) return manual;
  if (existing && existing.waist_hip_ratio != null && !isAutoWaistHipRatio(existing)) {
    return existing.waist_hip_ratio;
  }
  return calcWaistHipRatio(waist, hip);
}
