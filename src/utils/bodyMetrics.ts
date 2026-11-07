import type { Measurement } from '@/hooks/useMeasurements';

export type DerivedMeasurement = Measurement & { lean_mass: number | null };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** BMI = 體重(kg) / 身高(m)^2，四捨五入到小數 1 位。 */
export function calcBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (weightKg == null || heightCm == null || weightKg <= 0 || heightCm <= 0) return null;
  const m = heightCm / 100;
  return round1(weightKg / (m * m));
}

/** 去脂體重 = 體重 − 體脂肪量；沒有體脂肪量時改用 體重 × (1 − 體脂率)。 */
export function calcLeanMass(
  weightKg: number | null,
  bodyFatWeight: number | null,
  bodyFatRate: number | null,
): number | null {
  if (weightKg == null) return null;
  let lean: number | null = null;
  if (bodyFatWeight != null) lean = weightKg - bodyFatWeight;
  else if (bodyFatRate != null) lean = weightKg * (1 - bodyFatRate / 100);
  // 體脂肪量 > 體重之類的錯誤輸入，不顯示負值
  return lean != null && lean >= 0 ? round1(lean) : null;
}

/** 腰臀比 = 腰圍 / 臀圍，四捨五入到小數 2 位。 */
export function calcWaistHipRatio(waistCm: number | null, hipCm: number | null): number | null {
  if (waistCm == null || hipCm == null || waistCm <= 0 || hipCm <= 0) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

/** 顯示用：BMI 一律用目前身高重算，並補上去脂體重、腰臀比。 */
export function withDerivedMetrics(m: Measurement, heightCm: number | null): DerivedMeasurement {
  return {
    ...m,
    bmi: calcBmi(m.weight, heightCm),
    lean_mass: calcLeanMass(m.weight, m.body_fat_weight, m.body_fat_rate),
    // 有手填用手填，否則由腰圍/臀圍自動計算（自動值不寫入資料庫，腰臀圍改了會跟著變）
    waist_hip_ratio: m.waist_hip_ratio ?? calcWaistHipRatio(m.waist, m.hip),
  };
}
