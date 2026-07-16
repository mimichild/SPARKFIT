import { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Dimensions, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { Colors } from '@/constants/colors';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 40;
const NICE_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

type Mode = 'single' | 'range';
type DateTarget = 'single' | 'start' | 'end';

type MetricKey = keyof Omit<Measurement, 'date'>;

const METRICS: { key: MetricKey; label: string; unit: string }[] = [
  { key: 'weight',        label: '體重',      unit: 'kg'   },
  { key: 'bmi',            label: 'BMI',       unit: ''     },
  { key: 'body_fat_rate', label: '體脂肪率',  unit: '%'    },
  { key: 'muscle_weight', label: '肌肉重',    unit: 'kg'   },
  { key: 'bone_weight',   label: '骨量',      unit: 'kg'   },
  { key: 'visceral_fat',  label: '內臟脂肪',  unit: ''     },
  { key: 'bmr',           label: '基礎代謝',  unit: 'kcal' },
  { key: 'body_age',      label: '體年齡',    unit: '歲'   },
  { key: 'chest',         label: '胸圍',      unit: 'cm'   },
  { key: 'waist',         label: '腰圍',      unit: 'cm'   },
  { key: 'low_waist',     label: '低腰圍',    unit: 'cm'   },
  { key: 'hip',           label: '臀圍',      unit: 'cm'   },
  { key: 'thigh',         label: '大腿圍',    unit: 'cm'   },
  { key: 'arm',           label: '手臂圍',    unit: 'cm'   },
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatFull(d: Date): string {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`;
}

function formatShort(dateStr: string): string {
  return `${parseInt(dateStr.slice(5, 7))}/${parseInt(dateStr.slice(8, 10))}`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function makeDefaultStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d;
}

export default function ReportScreen() {
  const themeColor = useSettingsStore(s => s.themeColor);
  const { getMeasurement, getMeasurements } = useMeasurements();

  const [mode, setMode] = useState<Mode>('range');
  const [singleDate, setSingleDate] = useState(new Date());
  const [startDate, setStartDate] = useState(makeDefaultStart);
  const [endDate, setEndDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [pickerTarget, setPickerTarget] = useState<DateTarget>('single');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');

  const [singleData, setSingleData] = useState<Measurement | null>(null);
  const [rangeData, setRangeData] = useState<Measurement[]>([]);

  const loadSingle = useCallback(async () => {
    const m = await getMeasurement(toKey(singleDate));
    setSingleData(m);
  }, [singleDate, getMeasurement]);

  const loadRange = useCallback(async () => {
    const rows = await getMeasurements(toKey(startDate), toKey(endDate));
    setRangeData(rows);
  }, [startDate, endDate, getMeasurements]);

  useEffect(() => {
    if (mode === 'single') loadSingle();
    else loadRange();
  }, [mode, loadSingle, loadRange]);

  const openPicker = (target: DateTarget) => {
    const current = target === 'single' ? singleDate : target === 'start' ? startDate : endDate;
    setTempDate(current);
    setPickerTarget(target);
    setShowPicker(true);
  };

  const confirmDate = (date: Date) => {
    if (pickerTarget === 'single') setSingleDate(date);
    else if (pickerTarget === 'start') setStartDate(date);
    else setEndDate(date);
    setShowPicker(false);
  };

  // Chart data (only points with a value)
  const chartPoints = useMemo(() => {
    return rangeData.filter(m => m[selectedMetric] != null);
  }, [rangeData, selectedMetric]);

  const chartLabels = useMemo(() =>
    chartPoints.map(m => formatShort(m.date)),
    [chartPoints],
  );

  const chartValues = useMemo(() =>
    chartPoints.map(m => m[selectedMetric] as number),
    [chartPoints, selectedMetric],
  );

  const metricInfo = METRICS.find(m => m.key === selectedMetric)!;
  const rgb = hexToRgb(themeColor);

  // Nice Y-axis: find smallest magnitude-appropriate step giving ≤8 segments
  const niceYAxis = useMemo(() => {
    if (chartValues.length === 0) {
      return { niceMin: 0, step: 1, segments: 4, scaledMax: 4, decimalPlaces: 0 };
    }
    const dataMin = Math.min(...chartValues);
    const dataMax = Math.max(...chartValues);
    const avg = (dataMin + dataMax) / 2;

    // Magnitude-appropriate starting step
    let startIdx = 3; // default: step=1
    if (avg >= 1000) startIdx = 9;       // step=100
    else if (avg >= 100) startIdx = 6;   // step=10
    else if (avg >= 10) startIdx = 3;    // step=1
    else if (avg >= 1) startIdx = 2;     // step=0.5
    else startIdx = 0;                   // step=0.1

    for (let i = startIdx; i < NICE_STEPS.length; i++) {
      const s = NICE_STEPS[i];
      const nMin = Math.max(0, Math.floor(dataMin / s) * s - 2 * s);
      const nMax = Math.ceil(dataMax / s) * s + 2 * s;
      const segs = Math.round((nMax - nMin) / s);
      if (segs <= 8) {
        return { niceMin: nMin, step: s, segments: segs, scaledMax: segs, decimalPlaces: s < 1 ? 1 : 0 };
      }
    }
    return { niceMin: 0, step: 1, segments: 4, scaledMax: 4, decimalPlaces: 0 };
  }, [chartValues]);

  // Scale data to [0, scaledMax]; add tiny epsilon when all values identical
  // so the library never collapses to a single Y label (its min===max guard)
  const scaledValues = useMemo(() => {
    const raw = chartValues.map(v => (v - niceYAxis.niceMin) / niceYAxis.step);
    if (raw.length >= 2 && raw.every(v => v === raw[0])) {
      return [...raw.slice(0, -1), raw[raw.length - 1] + 1e-4];
    }
    return raw;
  }, [chartValues, niceYAxis]);

  // Custom Y-axis labels: positions derived from chart-kit's known geometry
  // drawH = height * DEFAULT_X_LABELS_HEIGHT_PERCENTAGE = 220 * 0.75 = 165
  // padT  = style.paddingTop (default 16 in chart-kit source)
  const yAxisLabels = useMemo(() => {
    const drawH = 220 * 0.75;
    const padT = 16;
    return Array.from({ length: niceYAxis.segments + 1 }, (_, i) => {
      const value = niceYAxis.niceMin + i * niceYAxis.step;
      const yPos = drawH - (drawH / niceYAxis.segments) * i + padT;
      return {
        top: Math.round(yPos - 5),
        label: niceYAxis.decimalPlaces > 0
          ? value.toFixed(1)
          : String(Math.round(value)),
      };
    });
  }, [niceYAxis]);

  // X-axis: thin labels when many points, rotate when > 8
  const { visibleLabels, labelRotation } = useMemo(() => {
    const n = chartLabels.length;
    if (n <= 8) return { visibleLabels: chartLabels, labelRotation: 0 };
    const step = Math.ceil(n / 10);
    return {
      visibleLabels: chartLabels.map((l, i) =>
        (i % step === 0 || i === n - 1) ? l : '',
      ),
      labelRotation: -30,
    };
  }, [chartLabels]);

  const chartConfig = useMemo(() => ({
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${rgb}, ${opacity})`,
    labelColor: () => Colors.textSecondary,
    propsForDots: { r: '5', strokeWidth: '0', fill: themeColor },
    propsForBackgroundLines: { stroke: '#F5F5F5', strokeDasharray: '' },
    propsForLabels: { fontSize: 10 },
  }), [themeColor, rgb]);

  return (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={[styles.appTitle, { color: themeColor }]}>SPARKFIT</Text>
        <Text style={styles.pageTitle}>報告</Text>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'single' && { backgroundColor: themeColor }]}
            onPress={() => setMode('single')}
          >
            <Text style={[styles.modeBtnText, mode === 'single' && styles.modeBtnTextActive]}>
              單日查看
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'range' && { backgroundColor: themeColor }]}
            onPress={() => setMode('range')}
          >
            <Text style={[styles.modeBtnText, mode === 'range' && styles.modeBtnTextActive]}>
              區間折線圖
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── SINGLE MODE ── */}
        {mode === 'single' && (
          <View>
            <TouchableOpacity style={styles.datePill} onPress={() => openPicker('single')}>
              <Text style={styles.datePillLabel}>日期</Text>
              <Text style={[styles.datePillValue, { color: themeColor }]}>{formatFull(singleDate)}</Text>
            </TouchableOpacity>

            {singleData == null ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>這一天尚無記錄</Text>
              </View>
            ) : (
              <View style={styles.metricGrid}>
                {METRICS.map(({ key, label, unit }) => {
                  const val = singleData[key];
                  return (
                    <View key={key} style={styles.metricCard}>
                      <Text style={styles.metricCardLabel}>{label}</Text>
                      <Text style={[styles.metricCardValue, { color: themeColor }]}>
                        {val != null ? (val as number).toFixed(1) : '──'}
                      </Text>
                      {unit ? <Text style={styles.metricCardUnit}>{unit}</Text> : null}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── RANGE MODE ── */}
        {mode === 'range' && (
          <View>
            {/* Date range row */}
            <View style={styles.rangeRow}>
              <TouchableOpacity style={styles.rangeDate} onPress={() => openPicker('start')}>
                <Text style={styles.rangeDateLabel}>開始</Text>
                <Text style={[styles.rangeDateValue, { color: themeColor }]}>
                  {`${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.rangeArrow}>→</Text>
              <TouchableOpacity style={styles.rangeDate} onPress={() => openPicker('end')}>
                <Text style={styles.rangeDateLabel}>結束</Text>
                <Text style={[styles.rangeDateValue, { color: themeColor }]}>
                  {`${endDate.getFullYear()}/${endDate.getMonth() + 1}/${endDate.getDate()}`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Metric chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContent}
            >
              {METRICS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    selectedMetric === key && { backgroundColor: themeColor, borderColor: themeColor },
                  ]}
                  onPress={() => setSelectedMetric(key)}
                >
                  <Text style={[styles.chipText, selectedMetric === key && styles.chipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Chart */}
            {chartPoints.length < 2 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {chartPoints.length === 0
                    ? '此區間尚無資料'
                    : '需要至少 2 筆資料才能顯示折線圖'}
                </Text>
              </View>
            ) : (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  {metricInfo.label}{metricInfo.unit ? `（${metricInfo.unit}）` : ''}
                </Text>
                <View style={[styles.chartWrap, { position: 'relative' }]}>
                  <LineChart
                    data={{
                      labels: visibleLabels,
                      datasets: [{ data: scaledValues }],
                    }}
                    width={CHART_W - 32}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    withDots
                    withShadow={false}
                    withInnerLines
                    withOuterLines={false}
                    withHorizontalLabels={false}
                    fromZero
                    fromNumber={niceYAxis.scaledMax}
                    segments={niceYAxis.segments}
                    horizontalLabelRotation={labelRotation}
                    style={styles.chart}
                    renderDotContent={({ x, y, index }) => {
                      const val = chartValues[index];
                      if (val == null) return null;
                      return (
                        <Text
                          key={index}
                          style={[styles.dotLabel, { left: x - 18, top: y - 22, color: themeColor }]}
                        >
                          {Number.isInteger(val) ? val : val.toFixed(1)}
                        </Text>
                      );
                    }}
                  />
                  {/* Custom Y-axis labels overlaid on chart's built-in left padding area */}
                  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    {yAxisLabels.map(({ top, label }, i) => (
                      <Text
                        key={i}
                        style={{
                          position: 'absolute',
                          top,
                          left: 0,
                          width: 56,
                          textAlign: 'right',
                          fontSize: 10,
                          color: Colors.textSecondary,
                        }}
                      >
                        {label}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal visible={showPicker} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerCancel}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDate(tempDate)}>
                  <Text style={[styles.pickerConfirm, { color: themeColor }]}>確認</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_, d) => d && setTempDate(d)}
                locale="zh-TW"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) confirmDate(d);
          }}
        />
      )}
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  appTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  pageTitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 2, marginBottom: 20 },

  // Mode toggle
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F0EAEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  modeBtnTextActive: { color: '#FFFFFF' },

  // Single date pill
  datePill: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  datePillLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  datePillValue: { fontSize: 14, fontWeight: '700' },

  // Single metric grid
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  metricCard: {
    width: '50%',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  metricCardInner: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  metricCardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    paddingTop: 14,
    paddingHorizontal: 10,
  },
  metricCardValue: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  metricCardUnit: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', paddingBottom: 14 },

  // Range
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  rangeDate: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeDateLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  rangeDateValue: { fontSize: 14, fontWeight: '700' },
  rangeArrow: { fontSize: 18, color: Colors.textSecondary },

  // Chips
  chipsScroll: { marginBottom: 16 },
  chipsContent: { paddingRight: 8, gap: 8, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // Chart
  chartCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chartWrap: { marginTop: 16 },
  chart: { borderRadius: 12, marginLeft: -8 },
  dotLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    width: 36,
  },

  // Empty
  empty: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: { fontSize: 14, color: Colors.textSecondary },

  // Date picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerCancel: { fontSize: 15, color: '#999999' },
  pickerConfirm: { fontSize: 15, fontWeight: '600' },
});
