import { calcBmi, calcLeanMass, calcWaistHipRatio, calcWaistHeightRatio, calcFfmi, withDerivedMetrics } from '@/utils/bodyMetrics';
import type { Measurement } from '@/hooks/useMeasurements';

function makeMeasurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    date: '2026-11-07',
    weight: null, chest: null, waist: null, low_waist: null, hip: null,
    thigh: null, calf: null, skeletal_muscle: null, underbust: null, arm: null, bmi: null, bmr: null, body_fat_rate: null,
    body_fat_weight: null, muscle_weight: null, bone_weight: null,
    visceral_fat: null, body_age: null, waist_hip_ratio: null,
    obesity_degree: null, recommended_calories: null,
    ...overrides,
  };
}

describe('calcBmi', () => {
  it('computes weight / height(m)^2 rounded to 1 decimal', () => {
    // 60 / 1.65^2 = 22.038...
    expect(calcBmi(60, 165)).toBe(22);
    // 72.5 / 1.78^2 = 22.882...
    expect(calcBmi(72.5, 178)).toBe(22.9);
  });

  it('returns null when weight or height is missing', () => {
    expect(calcBmi(null, 165)).toBeNull();
    expect(calcBmi(60, null)).toBeNull();
    expect(calcBmi(null, null)).toBeNull();
  });

  it('returns null for non-positive inputs', () => {
    expect(calcBmi(60, 0)).toBeNull();
    expect(calcBmi(0, 165)).toBeNull();
    expect(calcBmi(-60, 165)).toBeNull();
  });
});

describe('calcLeanMass', () => {
  it('uses weight - body fat weight when body fat weight is given', () => {
    expect(calcLeanMass(60, 15.2, null)).toBe(44.8);
  });

  it('prefers body fat weight over body fat rate when both are given', () => {
    expect(calcLeanMass(60, 15, 30)).toBe(45);
  });

  it('falls back to weight * (1 - rate/100) when only body fat rate is given', () => {
    expect(calcLeanMass(60, null, 25)).toBe(45);
  });

  it('returns null when weight is missing', () => {
    expect(calcLeanMass(null, 15, 25)).toBeNull();
  });

  it('returns null when body fat weight exceeds weight (bad input)', () => {
    expect(calcLeanMass(60, 70, null)).toBeNull();
  });

  it('returns null when neither body fat weight nor rate is given', () => {
    expect(calcLeanMass(60, null, null)).toBeNull();
  });
});

describe('calcWaistHipRatio', () => {
  it('computes waist / hip rounded to 2 decimals', () => {
    // 70 / 92 = 0.7608...
    expect(calcWaistHipRatio(70, 92)).toBe(0.76);
  });

  it('returns null when waist or hip is missing or non-positive', () => {
    expect(calcWaistHipRatio(null, 92)).toBeNull();
    expect(calcWaistHipRatio(70, null)).toBeNull();
    expect(calcWaistHipRatio(70, 0)).toBeNull();
  });
});

describe('calcWaistHeightRatio', () => {
  it('computes waist / height rounded to 2 decimals', () => {
    // 70 / 165 = 0.4242...
    expect(calcWaistHeightRatio(70, 165)).toBe(0.42);
  });

  it('returns null when waist or height is missing or non-positive', () => {
    expect(calcWaistHeightRatio(null, 165)).toBeNull();
    expect(calcWaistHeightRatio(70, null)).toBeNull();
    expect(calcWaistHeightRatio(70, 0)).toBeNull();
  });
});

describe('calcFfmi', () => {
  it('computes lean mass / height(m)^2 rounded to 1 decimal', () => {
    // 45 / 1.65^2 = 16.528...
    expect(calcFfmi(45, 165)).toBe(16.5);
  });

  it('returns null when lean mass or height is missing', () => {
    expect(calcFfmi(null, 165)).toBeNull();
    expect(calcFfmi(45, null)).toBeNull();
  });
});

describe('withDerivedMetrics', () => {
  it('adds waist_height_ratio and ffmi', () => {
    const m = makeMeasurement({ weight: 60, body_fat_weight: 15, waist: 70 });
    const d = withDerivedMetrics(m, 165);
    expect(d.waist_height_ratio).toBe(0.42);
    expect(d.ffmi).toBe(16.5);
  });

  it('auto-computes waist_hip_ratio from waist/hip when not entered manually', () => {
    const m = makeMeasurement({ waist: 70, hip: 92, waist_hip_ratio: null });
    expect(withDerivedMetrics(m, null).waist_hip_ratio).toBe(0.76);
  });

  it('keeps a manually entered waist_hip_ratio over the computed one', () => {
    const m = makeMeasurement({ waist: 70, hip: 92, waist_hip_ratio: 0.8 });
    expect(withDerivedMetrics(m, null).waist_hip_ratio).toBe(0.8);
  });

  it('overrides any stored BMI with one computed from current height', () => {
    const m = makeMeasurement({ weight: 60, bmi: 99 });
    expect(withDerivedMetrics(m, 165).bmi).toBe(22);
  });

  it('sets BMI to null when height is unknown, ignoring stale stored value', () => {
    const m = makeMeasurement({ weight: 60, bmi: 22 });
    expect(withDerivedMetrics(m, null).bmi).toBeNull();
  });

  it('adds lean_mass and keeps other fields untouched', () => {
    const m = makeMeasurement({ weight: 60, body_fat_weight: 15, calf: 34 });
    const d = withDerivedMetrics(m, 165);
    expect(d.lean_mass).toBe(45);
    expect(d.calf).toBe(34);
    expect(d.date).toBe('2026-11-07');
  });
});
