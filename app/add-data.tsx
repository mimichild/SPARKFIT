import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { Colors } from '@/constants/colors';
import { calcBmi, calcLeanMass, calcWaistHipRatio } from '@/utils/bodyMetrics';
import {
  diffWithExisting, mergeIntoExisting, isAutoWaistHipRatio, finalWaistHipRatio,
  type DiffRow, type DailyFieldKey,
} from '@/utils/measurementMerge';

type FormData = {
  height: string;
  shoulderWidth: string;
  targetWeight: string;
  weight: string;
  bodyFatRate: string;
  visceralFat: string;
  waistHipRatio: string;
  bodyFatWeight: string;
  bmr: string;
  chest: string;
  waist: string;
  lowWaist: string;
  hip: string;
  thigh: string;
  calf: string;
  arm: string;
};

const EMPTY_FORM: FormData = {
  height: '', shoulderWidth: '', targetWeight: '', weight: '',
  bodyFatRate: '', visceralFat: '', waistHipRatio: '', bodyFatWeight: '', bmr: '',
  chest: '', waist: '', lowWaist: '', hip: '', thigh: '', calf: '', arm: '',
};

// 已從畫面上移除，但仍需在儲存時原封不動帶回去，避免清空使用者手機上的舊資料
type HiddenFields = {
  bmi: number | null;
  muscle_weight: number | null;
  bone_weight: number | null;
  body_age: number | null;
  obesity_degree: number | null;
  recommended_calories: number | null;
};

const EMPTY_HIDDEN_FIELDS: HiddenFields = {
  bmi: null,
  muscle_weight: null,
  bone_weight: null,
  body_age: null,
  obesity_degree: null,
  recommended_calories: null,
};

// 每日欄位（資料庫欄位名）→ 表單欄位
const FORM_KEY: Record<DailyFieldKey, keyof FormData> = {
  weight: 'weight',
  body_fat_rate: 'bodyFatRate',
  visceral_fat: 'visceralFat',
  waist_hip_ratio: 'waistHipRatio',
  body_fat_weight: 'bodyFatWeight',
  bmr: 'bmr',
  chest: 'chest',
  waist: 'waist',
  low_waist: 'lowWaist',
  hip: 'hip',
  thigh: 'thigh',
  calf: 'calf',
  arm: 'arm',
};

function formatValue(n: number): string {
  return String(n);
}

function toNum(s: string): number | null {
  const n = parseFloat(s.trim());
  return isNaN(n) ? null : n;
}

function toStr(n: number | null | undefined): string {
  return n != null ? String(n) : '';
}

export default function AddDataScreen() {
  const { mode = 'add', date = '' } = useLocalSearchParams<{ mode: 'add' | 'edit'; date: string }>();

  const themeColor = useSettingsStore(s => s.themeColor);
  const height = useSettingsStore(s => s.height);
  const shoulderWidth = useSettingsStore(s => s.shoulderWidth);
  const targetWeight = useSettingsStore(s => s.targetWeight);
  const setHeight = useSettingsStore(s => s.setHeight);
  const setShoulderWidth = useSettingsStore(s => s.setShoulderWidth);
  const setTargetWeight = useSettingsStore(s => s.setTargetWeight);

  const { getMeasurement, saveMeasurement, deleteMeasurement } = useMeasurements();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [hiddenFields, setHiddenFields] = useState<HiddenFields>(EMPTY_HIDDEN_FIELDS);
  // 這天在資料庫裡已有的紀錄（新增模式下用來判斷是否要詢問覆蓋）
  const [existing, setExisting] = useState<Measurement | null>(null);
  // null = 還沒詢問過；陣列 = 使用者選了「否」，正在逐項比對新舊資料
  const [conflictRows, setConflictRows] = useState<DiffRow[] | null>(null);
  const [choices, setChoices] = useState<Partial<Record<DailyFieldKey, 'old' | 'new'>>>({});
  // 這天的舊資料載入完成前不允許儲存，避免整筆蓋掉舊紀錄
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    // 基本資料直接讀當下的設定值：不能放進依賴，否則設定一改就會重新載入、清空表單
    const { height, shoulderWidth, targetWeight } = useSettingsStore.getState();
    const m = await getMeasurement(date);
    setExisting(m);

    setHiddenFields({
      bmi: m?.bmi ?? null,
      muscle_weight: m?.muscle_weight ?? null,
      bone_weight: m?.bone_weight ?? null,
      body_age: m?.body_age ?? null,
      obesity_degree: m?.obesity_degree ?? null,
      recommended_calories: m?.recommended_calories ?? null,
    });

    if (mode === 'edit') {
      setForm({
        height: toStr(height),
        shoulderWidth: toStr(shoulderWidth),
        targetWeight: toStr(targetWeight),
        weight: toStr(m?.weight),
        bodyFatRate: toStr(m?.body_fat_rate),
        visceralFat: toStr(m?.visceral_fat),
        // 自動算出的腰臀比不放進輸入框，讓它隨腰圍/臀圍重新計算
        waistHipRatio: m && !isAutoWaistHipRatio(m) ? toStr(m.waist_hip_ratio) : '',
        bodyFatWeight: toStr(m?.body_fat_weight),
        bmr: toStr(m?.bmr),
        chest: toStr(m?.chest),
        waist: toStr(m?.waist),
        lowWaist: toStr(m?.low_waist),
        hip: toStr(m?.hip),
        thigh: toStr(m?.thigh),
        calf: toStr(m?.calf),
        arm: toStr(m?.arm),
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        height: toStr(height),
        shoulderWidth: toStr(shoulderWidth),
        targetWeight: toStr(targetWeight),
      });
    }
    setLoaded(true);
  }, [mode, date, getMeasurement]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const set = (key: keyof FormData) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const autoBmi = calcBmi(toNum(form.weight), toNum(form.height));
  const autoWaistHipRatio = calcWaistHipRatio(toNum(form.waist), toNum(form.hip));
  const autoLeanMass = calcLeanMass(toNum(form.weight), toNum(form.bodyFatWeight), toNum(form.bodyFatRate));

  const handleSave = async () => {
    if (!loaded) return;
    const newHeight = toNum(form.height);
    const newShoulderWidth = toNum(form.shoulderWidth);
    const newTargetWeight = toNum(form.targetWeight);

    const entered: Measurement = {
      date,
      weight: toNum(form.weight),
      chest: toNum(form.chest),
      waist: toNum(form.waist),
      low_waist: toNum(form.lowWaist),
      hip: toNum(form.hip),
      thigh: toNum(form.thigh),
      calf: toNum(form.calf),
      arm: toNum(form.arm),
      bmr: toNum(form.bmr),
      body_fat_rate: toNum(form.bodyFatRate),
      body_fat_weight: toNum(form.bodyFatWeight),
      visceral_fat: toNum(form.visceralFat),
      waist_hip_ratio: toNum(form.waistHipRatio),
      ...EMPTY_HIDDEN_FIELDS,
    };

    const persist = async (base: Measurement | null) => {
      const { bmi: storedBmi, ...otherHiddenFields } = hiddenFields;
      // base 有值 = 合併到舊資料（只覆蓋有填的欄位）；沒有 = 整筆以表單為準
      const m: Measurement = base
        ? mergeIntoExisting(base, entered)
        : { ...entered, ...otherHiddenFields };
      m.waist_hip_ratio = finalWaistHipRatio(entered.waist_hip_ratio, base, m.waist, m.hip);
      // 算不出來（沒身高或沒體重）時保留原本存的值，不要清空
      m.bmi = calcBmi(m.weight, newHeight) ?? storedBmi;
      try {
        await saveMeasurement(m);
      } catch {
        Alert.alert('儲存失敗', '請再試一次。');
        return;
      }
      // 真的存檔了才寫回基本資料（選「否」回去比對時不寫）
      if (newHeight !== height) setHeight(newHeight);
      if (newShoulderWidth !== shoulderWidth) setShoulderWidth(newShoulderWidth);
      if (newTargetWeight !== targetWeight) setTargetWeight(newTargetWeight);
      router.back();
    };

    if (mode !== 'add' || !existing) {
      await persist(null);
      return;
    }

    // 新增模式但這天已有紀錄：已逐項選好 → 直接合併；還沒問過 → 詢問是否覆蓋
    if (conflictRows !== null) {
      await persist(existing);
      return;
    }

    Alert.alert(
      '已有填寫資料',
      '這天已經有紀錄了，請問要覆蓋舊資料嗎？\n（這次沒填的欄位會保留舊資料）',
      [
        {
          text: '否',
          style: 'cancel',
          onPress: () => {
            const rows = diffWithExisting(existing, entered);
            setChoices(Object.fromEntries(rows.map(r => [r.key, 'new'])));
            setConflictRows(rows);
          },
        },
        { text: '是', onPress: () => { void persist(existing); } },
      ],
    );
  };

  const chooseValue = (row: DiffRow, which: 'old' | 'new') => {
    setChoices(c => ({ ...c, [row.key]: which }));
    // 舊的腰臀比是自動算的 → 清空輸入框，存檔時用目前的腰圍/臀圍重算，不要變成手填值
    if (row.key === 'waist_hip_ratio' && which === 'old' && existing && isAutoWaistHipRatio(existing)) {
      setForm(f => ({ ...f, waistHipRatio: '' }));
      return;
    }
    const value = which === 'old' ? row.oldValue : row.newValue;
    setForm(f => ({ ...f, [FORM_KEY[row.key]]: formatValue(value) }));
  };

  const handleDelete = () => {
    Alert.alert(
      '刪除這天的紀錄',
      '刪除後無法復原，確定要刪除嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            await deleteMeasurement(date);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.headerCancel}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{mode === 'edit' ? '修改數據' : '新增數據'}</Text>
          <View style={styles.headerRight}>
            {mode === 'edit' && (
              <TouchableOpacity onPress={handleDelete} hitSlop={12} testID="delete-btn">
                <Ionicons name="trash-outline" size={20} color="#FF6B8A" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSave} hitSlop={12} testID="save-btn">
              <Text style={[styles.headerSave, { color: themeColor }]}>儲存</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {conflictRows !== null && (
            <View style={styles.conflictBox}>
              <Text style={styles.conflictTitle}>這天已有資料</Text>
              {conflictRows.length === 0 ? (
                <Text style={styles.conflictText}>
                  新舊資料沒有數字不同的欄位，按「儲存」會把這次新填的欄位補進去，舊資料都會保留。
                </Text>
              ) : (
                <>
                  <Text style={styles.conflictText}>
                    以下欄位新舊數字不同，請選擇要保留哪一個，選好後按「儲存」。沒列出來的欄位：有填的會補進去，沒填的保留舊資料。
                  </Text>
                  {conflictRows.map(row => {
                    const picked = choices[row.key] ?? 'new';
                    return (
                      <View key={row.key} style={styles.conflictRow} testID={`conflict-${row.key}`}>
                        <Text style={styles.conflictLabel}>{row.label}</Text>
                        <View style={styles.conflictChoices}>
                          {(['old', 'new'] as const).map(which => {
                            const active = picked === which;
                            const value = which === 'old' ? row.oldValue : row.newValue;
                            return (
                              <TouchableOpacity
                                key={which}
                                onPress={() => chooseValue(row, which)}
                                style={[styles.choiceChip, active && { backgroundColor: themeColor, borderColor: themeColor }]}
                                testID={`conflict-${row.key}-${which}`}
                              >
                                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                                  {which === 'old' ? '舊' : '新'} {formatValue(value)}{row.unit ? ` ${row.unit}` : ''}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          )}

          <SectionHeader title="基本資料" subtitle="記錄一次即可" />
          <Field label="身高" value={form.height} onChange={set('height')} unit="cm" />
          <Field label="肩寬" value={form.shoulderWidth} onChange={set('shoulderWidth')} unit="cm" />
          <Field label="目標體重" value={form.targetWeight} onChange={set('targetWeight')} unit="kg" />

          <SectionHeader title="身體組成" />
          <Field label="體重" value={form.weight} onChange={set('weight')} unit="kg" />
          <Field label="體脂率" value={form.bodyFatRate} onChange={set('bodyFatRate')} unit="%" />
          <Field label="內臟脂肪等級" value={form.visceralFat} onChange={set('visceralFat')} unit="" />
          <Field
            label="腰臀比"
            value={form.waistHipRatio}
            onChange={set('waistHipRatio')}
            unit=""
            hint="空白則用腰圍÷臀圍自動算"
            placeholder={autoWaistHipRatio != null ? autoWaistHipRatio.toFixed(2) : undefined}
          />
          <Field label="體脂肪量" value={form.bodyFatWeight} onChange={set('bodyFatWeight')} unit="kg" />
          <AutoField label="去脂體重" value={autoLeanMass} unit="kg" hint="體重 − 體脂肪量" />
          <Field label="基礎代謝率" value={form.bmr} onChange={set('bmr')} unit="kcal" />
          <AutoField label="BMI" value={autoBmi} unit="" hint="由身高、體重計算" />

          <SectionHeader title="身體尺寸" />
          <Field label="胸圍" value={form.chest} onChange={set('chest')} unit="cm" />
          <Field label="腰圍" value={form.waist} onChange={set('waist')} unit="cm" />
          <Field label="低腰圍" value={form.lowWaist} onChange={set('lowWaist')} unit="cm" />
          <Field label="臀圍" value={form.hip} onChange={set('hip')} unit="cm" />
          <Field label="大腿圍" value={form.thigh} onChange={set('thigh')} unit="cm" />
          <Field label="小腿圍" value={form.calf} onChange={set('calf')} unit="cm" />
          <Field label="手臂圍" value={form.arm} onChange={set('arm')} unit="cm" />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  hint?: string;
  placeholder?: string;
};

function Field({ label, value, onChange, unit, required, hint, placeholder }: FieldProps) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLeft}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required ? (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>必填</Text>
          </View>
        ) : null}
        {hint ? <Text style={styles.autoHint}>{hint}</Text> : null}
      </View>
      <View style={styles.fieldRight}>
        <TextInput
          testID={`field-${label}`}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder={placeholder ?? '＿'}
          placeholderTextColor={placeholder ? Colors.textSecondary : '#CCCCCC'}
          textAlign="right"
        />
        {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function AutoField({ label, value, unit, hint }: { label: string; value: number | null; unit: string; hint: string }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLeft}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.autoHint}>{hint}</Text>
      </View>
      <View style={styles.fieldRight}>
        <Text testID={`auto-${label}`} style={[styles.fieldInput, styles.autoValue, value == null && styles.autoPlaceholder]}>
          {value != null ? value.toFixed(1) : '＿'}
        </Text>
        {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  conflictBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF6F8',
    borderWidth: 1,
    borderColor: '#FFD6DF',
    gap: 8,
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  conflictText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  conflictLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  conflictChoices: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  choiceText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  choiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  autoHint: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  autoValue: {
    textAlign: 'right',
    color: Colors.textSecondary,
  },
  autoPlaceholder: {
    color: '#CCCCCC',
  },
  fieldUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    minWidth: 30,
  },
});
