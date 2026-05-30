import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { MeasurementCard } from '@/components/MeasurementCard';
import { Ionicons } from '@expo/vector-icons';

import { AddDataModal } from '@/components/AddDataModal';
import { Colors } from '@/constants/colors';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${WEEKDAYS[d.getDay()]}）`;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  const { getMeasurement } = useMeasurements();
  const dateKey = toDateKey(selectedDate);

  const loadMeasurement = useCallback(async () => {
    const m = await getMeasurement(dateKey);
    setMeasurement(m);
  }, [dateKey, getMeasurement]);

  useEffect(() => {
    loadMeasurement();
  }, [loadMeasurement]);

  const openPicker = () => {
    setTempDate(selectedDate);
    setShowPicker(true);
  };

  const w = measurement?.weight ?? null;

  return (
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
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>目前體重</Text>
            <View style={styles.requiredBadge}>
              <Text style={[styles.requiredText, { color: themeColor }]}>必填選項</Text>
            </View>
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

      {/* ── FAB 新增 ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColor }]}
        activeOpacity={0.85}
        onPress={() => { setModalMode('add'); setShowAddModal(true); }}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* ── FAB 編輯 ── */}
      <TouchableOpacity
        style={[styles.editBtn, { backgroundColor: themeColor }]}
        activeOpacity={0.85}
        onPress={() => { setModalMode('edit'); setShowAddModal(true); }}
      >
        <Ionicons name="pencil" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ── 新增／修改數據 Modal ── */}
      <AddDataModal
        visible={showAddModal}
        themeColor={themeColor}
        selectedDate={dateKey}
        mode={modalMode}
        onClose={() => setShowAddModal(false)}
        onSaved={loadMeasurement}
      />

      {/* ── iOS 日期選擇器 Modal ── */}
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
                <TouchableOpacity
                  onPress={() => { setSelectedDate(tempDate); setShowPicker(false); }}
                >
                  <Text style={[styles.pickerConfirm, { color: themeColor }]}>確認</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => date && setTempDate(date)}
                locale="zh-TW"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── Android 日期選擇器 ── */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </SafeAreaView>
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
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  requiredBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
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

  // Date picker modal (iOS)
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
  pickerCancel: {
    fontSize: 15,
    color: '#999999',
  },
  pickerConfirm: {
    fontSize: 15,
    fontWeight: '600',
  },
});
