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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  const { getMeasurement, getLatestMeasurement } = useMeasurements();
  const dateKey = toDateKey(selectedDate);

  const loadMeasurement = useCallback(async () => {
    const m = await getMeasurement(dateKey);
    if (m) {
      setMeasurement(m);
      return;
    }
    if (dateKey === toDateKey(new Date())) {
      const latest = await getLatestMeasurement();
      setMeasurement(latest);
      return;
    }
    setMeasurement(null);
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

  return (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={[styles.appTitle, { color: themeColor }]}>SPARKFIT</Text>
        <TouchableOpacity onPress={openPicker} activeOpacity={0.7}>
          <Text style={styles.date}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        {/* ── 體重 Hero ── */}
        <View style={[styles.heroCard, { backgroundColor: themeColor }]}>
          <Text style={styles.heroLabel}>目前體重</Text>
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

        {/* ── 身體尺寸 ── */}
        <Text style={styles.sectionTitle}>身體尺寸</Text>
        <View style={styles.grid}>
          <MeasurementCard label="胸圍" value={measurement?.chest ?? null} unit="cm" valueColor={themeColor} />
          <MeasurementCard label="腰圍" value={measurement?.waist ?? null} unit="cm" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="低腰圍" value={measurement?.low_waist ?? null} unit="cm" valueColor={themeColor} />
          <MeasurementCard label="臀圍" value={measurement?.hip ?? null} unit="cm" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="大腿" value={measurement?.thigh ?? null} unit="cm" valueColor={themeColor} />
          <MeasurementCard label="手臂" value={measurement?.arm ?? null} unit="cm" valueColor={themeColor} />
        </View>

        {/* ── 身體組成 ── */}
        <Text style={styles.sectionTitle}>身體組成</Text>
        <View style={styles.grid}>
          <MeasurementCard label="BMI" value={measurement?.bmi ?? null} unit="" valueColor={themeColor} />
          <MeasurementCard label="基礎代謝" value={measurement?.bmr ?? null} unit="kcal" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="體脂肪率" value={measurement?.body_fat_rate ?? null} unit="%" valueColor={themeColor} />
          <MeasurementCard label="體脂肪重" value={measurement?.body_fat_weight ?? null} unit="kg" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="肌肉重" value={measurement?.muscle_weight ?? null} unit="kg" valueColor={themeColor} />
          <MeasurementCard label="骨骼重" value={measurement?.bone_weight ?? null} unit="kg" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="內臟脂肪" value={measurement?.visceral_fat ?? null} unit="" valueColor={themeColor} />
          <MeasurementCard label="體年齡" value={measurement?.body_age ?? null} unit="歲" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="腰臀比" value={measurement?.waist_hip_ratio ?? null} unit="" valueColor={themeColor} />
          <MeasurementCard label="肥胖度" value={measurement?.obesity_degree ?? null} unit="%" valueColor={themeColor} />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="建議熱量攝取" value={measurement?.recommended_calories ?? null} unit="kcal" valueColor={themeColor} />
          <View style={{ flex: 1, margin: 4 }} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
  heroLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    marginBottom: 8,
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
