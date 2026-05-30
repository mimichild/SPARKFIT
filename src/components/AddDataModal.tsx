import { useEffect, useState, useCallback } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { Colors } from '@/constants/colors';

type Props = {
  visible: boolean;
  themeColor: string;
  selectedDate: string;
  onClose: () => void;
  onSaved: () => void;
};

type FormData = {
  height: string;
  targetWeight: string;
  weight: string;
  chest: string;
  waist: string;
  lowWaist: string;
  hip: string;
  thigh: string;
  arm: string;
  bmi: string;
  bmr: string;
  bodyFatRate: string;
  bodyFatWeight: string;
  muscleWeight: string;
  boneWeight: string;
  visceralFat: string;
  bodyAge: string;
  waistHipRatio: string;
  obesityDegree: string;
  recommendedCalories: string;
};

const EMPTY_FORM: FormData = {
  height: '', targetWeight: '', weight: '',
  chest: '', waist: '', lowWaist: '', hip: '', thigh: '', arm: '',
  bmi: '', bmr: '', bodyFatRate: '', bodyFatWeight: '',
  muscleWeight: '', boneWeight: '', visceralFat: '', bodyAge: '',
  waistHipRatio: '', obesityDegree: '', recommendedCalories: '',
};

function toNum(s: string): number | null {
  const n = parseFloat(s.trim());
  return isNaN(n) ? null : n;
}

function toStr(n: number | null | undefined): string {
  return n != null ? String(n) : '';
}

export function AddDataModal({ visible, themeColor, selectedDate, onClose, onSaved }: Props) {
  const height = useSettingsStore(s => s.height);
  const targetWeight = useSettingsStore(s => s.targetWeight);
  const setHeight = useSettingsStore(s => s.setHeight);
  const setTargetWeight = useSettingsStore(s => s.setTargetWeight);

  const { getMeasurement, saveMeasurement } = useMeasurements();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const loadData = useCallback(async () => {
    const m = await getMeasurement(selectedDate);
    setForm({
      height: toStr(height),
      targetWeight: toStr(targetWeight),
      weight: toStr(m?.weight),
      chest: toStr(m?.chest),
      waist: toStr(m?.waist),
      lowWaist: toStr(m?.low_waist),
      hip: toStr(m?.hip),
      thigh: toStr(m?.thigh),
      arm: toStr(m?.arm),
      bmi: toStr(m?.bmi),
      bmr: toStr(m?.bmr),
      bodyFatRate: toStr(m?.body_fat_rate),
      bodyFatWeight: toStr(m?.body_fat_weight),
      muscleWeight: toStr(m?.muscle_weight),
      boneWeight: toStr(m?.bone_weight),
      visceralFat: toStr(m?.visceral_fat),
      bodyAge: toStr(m?.body_age),
      waistHipRatio: toStr(m?.waist_hip_ratio),
      obesityDegree: toStr(m?.obesity_degree),
      recommendedCalories: toStr(m?.recommended_calories),
    });
  }, [selectedDate, height, targetWeight, getMeasurement]);

  useEffect(() => {
    if (visible) loadData();
  }, [visible, loadData]);

  const set = (key: keyof FormData) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.weight.trim()) {
      Alert.alert('提醒', '體重為必填欄位，請輸入今日體重');
      return;
    }

    const newHeight = toNum(form.height);
    const newTargetWeight = toNum(form.targetWeight);
    if (newHeight !== height) setHeight(newHeight);
    if (newTargetWeight !== targetWeight) setTargetWeight(newTargetWeight);

    const m: Measurement = {
      date: selectedDate,
      weight: toNum(form.weight),
      chest: toNum(form.chest),
      waist: toNum(form.waist),
      low_waist: toNum(form.lowWaist),
      hip: toNum(form.hip),
      thigh: toNum(form.thigh),
      arm: toNum(form.arm),
      bmi: toNum(form.bmi),
      bmr: toNum(form.bmr),
      body_fat_rate: toNum(form.bodyFatRate),
      body_fat_weight: toNum(form.bodyFatWeight),
      muscle_weight: toNum(form.muscleWeight),
      bone_weight: toNum(form.boneWeight),
      visceral_fat: toNum(form.visceralFat),
      body_age: toNum(form.bodyAge),
      waist_hip_ratio: toNum(form.waistHipRatio),
      obesity_degree: toNum(form.obesityDegree),
      recommended_calories: toNum(form.recommendedCalories),
    };

    await saveMeasurement(m);
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.headerCancel}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>新增數據</Text>
            <TouchableOpacity onPress={handleSave} hitSlop={12}>
              <Text style={[styles.headerSave, { color: themeColor }]}>儲存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SectionHeader title="基本資料" subtitle="記錄一次即可" />
            <Field label="身高" value={form.height} onChange={set('height')} unit="cm" />
            <Field label="目標體重" value={form.targetWeight} onChange={set('targetWeight')} unit="kg" />

            <SectionHeader title="身體尺寸" />
            <Field label="體重" value={form.weight} onChange={set('weight')} unit="kg" required />
            <Field label="胸圍" value={form.chest} onChange={set('chest')} unit="cm" />
            <Field label="腰圍" value={form.waist} onChange={set('waist')} unit="cm" />
            <Field label="低腰圍" value={form.lowWaist} onChange={set('lowWaist')} unit="cm" />
            <Field label="臀圍" value={form.hip} onChange={set('hip')} unit="cm" />
            <Field label="大腿" value={form.thigh} onChange={set('thigh')} unit="cm" />
            <Field label="手臂" value={form.arm} onChange={set('arm')} unit="cm" />

            <SectionHeader title="身體組成" />
            <Field label="BMI" value={form.bmi} onChange={set('bmi')} unit="" />
            <Field label="基礎代謝" value={form.bmr} onChange={set('bmr')} unit="kcal" />
            <Field label="體脂肪率" value={form.bodyFatRate} onChange={set('bodyFatRate')} unit="%" />
            <Field label="體脂肪重" value={form.bodyFatWeight} onChange={set('bodyFatWeight')} unit="kg" />
            <Field label="肌肉重" value={form.muscleWeight} onChange={set('muscleWeight')} unit="kg" />
            <Field label="骨骼重" value={form.boneWeight} onChange={set('boneWeight')} unit="kg" />
            <Field label="內臟脂肪" value={form.visceralFat} onChange={set('visceralFat')} unit="" />
            <Field label="體年齡" value={form.bodyAge} onChange={set('bodyAge')} unit="歲" />
            <Field label="腰臀比" value={form.waistHipRatio} onChange={set('waistHipRatio')} unit="" />
            <Field label="肥胖度" value={form.obesityDegree} onChange={set('obesityDegree')} unit="%" />
            <Field label="建議熱量攝取" value={form.recommendedCalories} onChange={set('recommendedCalories')} unit="kcal" />

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  required?: boolean;
};

function Field({ label, value, onChange, unit, required }: FieldProps) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLeft}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required ? (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>必填</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.fieldRight}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="──"
          placeholderTextColor="#CCCCCC"
          textAlign="right"
        />
        {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCancel: {
    fontSize: 15,
    color: '#999999',
    minWidth: 36,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSave: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  requiredBadge: {
    backgroundColor: '#FFEEF0',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  requiredText: {
    fontSize: 10,
    color: '#FF6B8A',
    fontWeight: '600',
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    minWidth: 80,
    padding: 0,
  },
  fieldUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    minWidth: 30,
  },
});
