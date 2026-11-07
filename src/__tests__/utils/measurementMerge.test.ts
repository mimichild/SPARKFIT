import {
  diffWithExisting,
  mergeIntoExisting,
  isAutoWaistHipRatio,
  finalWaistHipRatio,
} from '@/utils/measurementMerge';
import type { Measurement } from '@/hooks/useMeasurements';

function makeMeasurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    date: '2026-11-07',
    weight: null, chest: null, waist: null, low_waist: null, hip: null,
    thigh: null, calf: null, arm: null, bmi: null, bmr: null, body_fat_rate: null,
    body_fat_weight: null, muscle_weight: null, bone_weight: null,
    visceral_fat: null, body_age: null, waist_hip_ratio: null,
    obesity_degree: null, recommended_calories: null,
    ...overrides,
  };
}

describe('diffWithExisting', () => {
  it('lists only fields filled in both where the values differ', () => {
    const existing = makeMeasurement({ weight: 62, waist: 70, body_fat_rate: 25 });
    const entered = makeMeasurement({ weight: 61.5, waist: 70, hip: 92 });

    const rows = diffWithExisting(existing, entered);

    expect(rows).toEqual([
      { key: 'weight', label: '體重', unit: 'kg', oldValue: 62, newValue: 61.5 },
    ]);
  });

  it('returns an empty list when nothing conflicts', () => {
    const existing = makeMeasurement({ weight: 62 });
    const entered = makeMeasurement({ waist: 70 });
    expect(diffWithExisting(existing, entered)).toEqual([]);
  });

  it('ignores hidden fields such as muscle_weight', () => {
    const existing = makeMeasurement({ muscle_weight: 40 });
    const entered = makeMeasurement({ muscle_weight: 41 });
    expect(diffWithExisting(existing, entered)).toEqual([]);
  });
});

describe('mergeIntoExisting', () => {
  it('overwrites filled fields and keeps old values for blank ones', () => {
    const existing = makeMeasurement({ weight: 62, waist: 70, body_fat_rate: 25, muscle_weight: 40 });
    const entered = makeMeasurement({ weight: 61.5, calf: 34 });

    const merged = mergeIntoExisting(existing, entered);

    expect(merged.weight).toBe(61.5);
    expect(merged.waist).toBe(70);
    expect(merged.body_fat_rate).toBe(25);
    expect(merged.calf).toBe(34);
    expect(merged.muscle_weight).toBe(40);
  });
});

describe('isAutoWaistHipRatio', () => {
  it('is true when the stored ratio equals waist/hip', () => {
    expect(isAutoWaistHipRatio(makeMeasurement({ waist: 70, hip: 92, waist_hip_ratio: 0.76 }))).toBe(true);
  });

  it('is false for a manually entered ratio', () => {
    expect(isAutoWaistHipRatio(makeMeasurement({ waist: 70, hip: 92, waist_hip_ratio: 0.8 }))).toBe(false);
  });

  it('is false when no ratio is stored', () => {
    expect(isAutoWaistHipRatio(makeMeasurement({ waist: 70, hip: 92 }))).toBe(false);
  });
});

describe('finalWaistHipRatio', () => {
  it('uses the manual value when given', () => {
    expect(finalWaistHipRatio(0.8, null, 70, 92)).toBe(0.8);
  });

  it('computes from waist/hip when nothing was entered', () => {
    expect(finalWaistHipRatio(null, null, 70, 92)).toBe(0.76);
  });

  it('keeps an existing manual ratio when merging without a new manual value', () => {
    const existing = makeMeasurement({ waist: 70, hip: 92, waist_hip_ratio: 0.8 });
    expect(finalWaistHipRatio(null, existing, 72, 92)).toBe(0.8);
  });

  it('recomputes when the existing ratio was auto-calculated', () => {
    const existing = makeMeasurement({ waist: 70, hip: 92, waist_hip_ratio: 0.76 });
    // 72 / 92 = 0.7826
    expect(finalWaistHipRatio(null, existing, 72, 92)).toBe(0.78);
  });

  it('returns null when it cannot be computed', () => {
    expect(finalWaistHipRatio(null, null, null, 92)).toBeNull();
  });
});
