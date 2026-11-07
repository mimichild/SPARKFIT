import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { MeasurementCard } from '@/components/MeasurementCard';
import { DataCalendarModal } from '@/components/DataCalendarModal';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { toDateKey, formatDate } from '@/utils/date';
import { withDerivedMetrics } from '@/utils/bodyMetrics';
import { MetricInfoModal } from '@/components/MetricInfoModal';
import {
  METRIC_INFO, HOME_COMPOSITION_METRICS, HOME_SIZE_METRICS, type HomeMetric,
} from '@/constants/metricInfo';

/** 兩個一列排版 */
function pairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

function isEmptyMeasurement(m: Measurement): boolean {
  return Object.entries(m).every(([key, value]) => key === 'date' || value == null);
}

function buildGoalHint(targetWeight: number | null, currentWeight: number | null | undefined): string {
  const tw = targetWeight != null ? `${targetWeight}` : '__';
  if (targetWeight != null && currentWeight != null) {
    const diff = Math.abs(currentWeight - targetWeight).toFixed(1);
    return `目標體重 ${tw} kg，只差 ${diff} kg！`;
  }
  return `目標體重 ${tw} kg，只差 __ kg！`;
}

export default function DataScreen() {
  const themeColor = useSettingsStore(s => s.themeColor);
  const targetWeight = useSettingsStore(s => s.targetWeight);
  const height = useSettingsStore(s => s.height);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [infoKey, setInfoKey] = useState<string | null>(null);

  const { getMeasurement, getLatestMeasurement } = useMeasurements();
  const dateKey = toDateKey(selectedDate);

  const loadMeasurement = useCallback(async () => {
    const m = await getMeasurement(dateKey);
    const isToday = dateKey === toDateKey(new Date());
    if (isToday && (!m || isEmptyMeasurement(m))) {
      const latest = await getLatestMeasurement(dateKey);
      setMeasurement(latest);
      return;
    }
    setMeasurement(m);
  }, [dateKey, getMeasurement, getLatestMeasurement]);

  useEffect(() => {
    loadMeasurement();
  }, [loadMeasurement]);

  useFocusEffect(useCallback(() => {
    loadMeasurement();
  }, [loadMeasurement]));

  const openPicker = () => {
    setShowPicker(true);
  };

  const w = measurement?.weight ?? null;
  const d = measurement ? withDerivedMetrics(measurement, height) : null;

  const renderMetricRows = (metrics: HomeMetric[]) =>
    pairs(metrics).map(row => (
      <View style={styles.grid} key={row[0].key}>
        {row.map(({ key, label, unit, decimals }) => (
          <MeasurementCard
            key={key}
            label={label}
            value={(d?.[key] as number | null | undefined) ?? null}
            unit={unit}
            decimals={decimals}
            valueColor={themeColor}
            onInfoPress={() => setInfoKey(key)}
          />
        ))}
        {row.length === 1 && <View style={{ flex: 1, margin: 4 }} />}
      </View>
    ));

  return (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={26} color={themeColor} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.appTitle, { color: themeColor }]}>SPARK SCALE</Text>
            <TouchableOpacity onPress={openPicker} activeOpacity={0.7}>
              <Text style={styles.date}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── 體重 Hero ── */}
        <View style={[styles.heroCard, { backgroundColor: themeColor }]}>
          <View style={styles.heroLabelRow}>
            <Text style={styles.heroLabel}>目前體重</Text>
            <TouchableOpacity onPress={() => setInfoKey('weight')} hitSlop={10} testID="info-目前體重">
              <Text style={styles.heroInfo}>(?)</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{w != null ? w.toFixed(1) : '──'}</Text>
            <Text style={styles.heroUnit}>kg</Text>
          </View>
          {w == null && (
            <Text style={styles.heroHint}>尚無紀錄，點擊 + 開始記錄</Text>
          )}
        </View>

        {/* ── 目標體重提示 ── */}
        <Text style={styles.goalHint}>{buildGoalHint(targetWeight, w)}</Text>

        {/* ── 身體組成 ── */}
        <Text style={styles.sectionTitle}>身體組成</Text>
        {renderMetricRows(HOME_COMPOSITION_METRICS)}

        {/* ── 身體尺寸 ── */}
        <Text style={styles.sectionTitle}>身體尺寸</Text>
        {renderMetricRows(HOME_SIZE_METRICS)}

        <View style={{ height: 100 }} />
      </ScrollView>

      <MetricInfoModal
        info={infoKey ? METRIC_INFO[infoKey] ?? null : null}
        onClose={() => setInfoKey(null)}
        themeColor={themeColor}
      />

      {/* ── 日期選擇月曆 ── */}
      <DataCalendarModal
        visible={showPicker}
        selectedDate={selectedDate}
        themeColor={themeColor}
        onConfirm={(date) => { setSelectedDate(date); setShowPicker(false); }}
        onCancel={() => setShowPicker(false)}
      />
    </SafeAreaView>

      {/* ── FAB 新增 ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColor }]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/add-data', params: { mode: 'add', date: dateKey } })}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* ── FAB 編輯 ── */}
      <TouchableOpacity
        style={[styles.editBtn, { backgroundColor: themeColor }]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/add-data', params: { mode: 'edit', date: dateKey } })}
      >
        <Ionicons name="pencil" size={24} color="#FFFFFF" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },

  // Hero card
  heroCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  heroInfo: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 52,
  },
  heroUnit: {
    fontSize: 20,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: '500',
  },
  heroHint: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // Goal hint
  goalHint: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 16,
    marginTop: 4,
  },

  // Sections
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  editBtn: {
    position: 'absolute',
    bottom: 50,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
