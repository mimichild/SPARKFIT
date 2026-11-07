import { METRIC_INFO, HOME_COMPOSITION_METRICS, HOME_SIZE_METRICS } from '@/constants/metricInfo';

describe('METRIC_INFO', () => {
  it('has an explanation for weight and every metric shown on the home screen', () => {
    const keys = ['weight', ...HOME_COMPOSITION_METRICS.map(m => m.key), ...HOME_SIZE_METRICS.map(m => m.key)];
    for (const key of keys) {
      expect(METRIC_INFO[key]?.description?.length ?? 0).toBeGreaterThan(10);
    }
  });

  it('lists body composition in the requested order', () => {
    expect(HOME_COMPOSITION_METRICS.map(m => m.label)).toEqual([
      '骨骼肌量', '體脂率', '內臟脂肪等級', '腰臀比', '腰高比',
      '體脂肪量', '去脂體重', '基礎代謝率', 'BMI', 'FFMI',
    ]);
  });

  it('lists body size with 下胸圍 beside 胸圍', () => {
    expect(HOME_SIZE_METRICS.map(m => m.label)).toEqual([
      '胸圍', '下胸圍', '腰圍', '低腰圍', '臀圍', '大腿圍', '小腿圍', '手臂圍',
    ]);
  });
});
