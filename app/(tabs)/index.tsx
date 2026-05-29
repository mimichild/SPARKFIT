import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSettingsStore } from '@/stores/settingsStore';
import { MeasurementCard } from '@/components/MeasurementCard';
import { Colors } from '@/constants/colors';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${WEEKDAYS[d.getDay()]}）`;
}

export default function DataScreen() {
  const themeColor = useSettingsStore((s) => s.themeColor);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const openPicker = () => {
    setTempDate(selectedDate);
    setShowPicker(true);
  };

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
            <Text style={styles.heroValue}>──</Text>
            <Text style={styles.heroUnit}>kg</Text>
          </View>
          <Text style={styles.heroHint}>尚無紀錄，點擊 + 開始記錄</Text>
        </View>

        {/* ── 身體尺寸 ── */}
        <Text style={styles.sectionTitle}>身體尺寸</Text>
        <View style={styles.grid}>
          <MeasurementCard label="胸圍" value={null} unit="cm" />
          <MeasurementCard label="腰圍" value={null} unit="cm" />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="低腰圍" value={null} unit="cm" />
          <MeasurementCard label="臀圍" value={null} unit="cm" />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="大腿" value={null} unit="cm" />
          <MeasurementCard label="手臂" value={null} unit="cm" />
        </View>

        {/* ── 身體組成 ── */}
        <Text style={styles.sectionTitle}>身體組成（選填）</Text>
        <View style={styles.grid}>
          <MeasurementCard label="BMI" value={null} unit="" />
          <MeasurementCard label="體脂率" value={null} unit="%" />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="內臟脂肪" value={null} unit="" />
          <MeasurementCard label="基礎代謝" value={null} unit="kcal" />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="肌肉重" value={null} unit="kg" />
          <MeasurementCard label="骨骼率" value={null} unit="%" />
        </View>
        <View style={styles.grid}>
          <MeasurementCard label="體年齡" value={null} unit="歲" />
          <View style={{ flex: 1, margin: 4 }} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColor }]}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

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
    marginBottom: 28,
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
    bottom: 80,
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
