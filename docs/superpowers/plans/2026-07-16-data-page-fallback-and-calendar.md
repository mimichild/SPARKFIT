# 數據頁：延續最新資料 + 月曆標記有資料日期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 數據頁在「今天」沒有紀錄時延續顯示最近一次的資料；並把日期選擇器換成自訂月曆元件，標記出當月有資料的日期供使用者點選查看。

**Architecture:** 抽出共用日期工具到 `src/utils/date.ts`；新增 `src/components/DataCalendarModal.tsx`（用 `react-native-calendars` 畫月曆、用既有的 `useMeasurements().getMeasurements()` 查當月有資料的日期做標記）；在 `app/(tabs)/index.tsx` 的 `loadMeasurement()` 加上「今天無資料時查 `getLatestMeasurement()`」的邏輯，並把原本 iOS/Android 兩段 `DateTimePicker` 換成新的 `DataCalendarModal`。

**Tech Stack:** React Native 0.81.5 / Expo SDK ~54 / TypeScript ~5.9.2（strict）/ `react-native-calendars`（新增依賴）/ pnpm

## Global Constraints

- 套件管理員固定用 pnpm（`packageManager: pnpm@11.13.0`），安裝依賴一律用 `pnpm add`。
- Import 路徑使用 `@/*` alias（對應 `src/*`）。
- TypeScript strict 模式，不可用 `any`（本計畫中月曆標記型別自行定義 `DayMarking`，避免依賴不確定的套件型別匯出）。
- 依照設計文件（`docs/superpowers/specs/2026-07-16-data-page-fallback-and-calendar-design.md`）明確決議：**不新增自動化測試**，一律用 `pnpm typecheck` + 手動在模擬器/實機驗證。
- 「延續最新資料」只套用在「今天」；使用者透過月曆手動選到其他無資料的日期，維持顯示空白，不延續。
- 月曆選取採「點選 → 反白暫存 → 按確定才套用」的模式，「取消」則不套用。
- `app/(tabs)/report.tsx` 中另一處 `DateTimePicker` 用法不在本次修改範圍內，不要動它。

---

### Task 1: 抽出共用日期工具 `src/utils/date.ts`

**Files:**
- Create: `src/utils/date.ts`
- Modify: `app/(tabs)/index.tsx:17-30`（刪除本地的 `WEEKDAYS`/`formatDate`/`toDateKey`，改成 import）

**Interfaces:**
- Produces: `WEEKDAYS: string[]`、`toDateKey(d: Date): DateString`、`formatDate(d: Date): string` — 給 Task 2（`DataCalendarModal`）與 `index.tsx` 共用。

- [ ] **Step 1: 建立 `src/utils/date.ts`**

```ts
import type { DateString } from '@/types';

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function toDateKey(d: Date): DateString {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${WEEKDAYS[d.getDay()]}）`;
}
```

- [ ] **Step 2: 修改 `app/(tabs)/index.tsx`，改用共用工具**

找到這段（第 17-30 行附近）：

```ts
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
```

替換成：

```ts
import { Colors } from '@/constants/colors';
import { toDateKey, formatDate } from '@/utils/date';
```

（`buildGoalHint` 函式維持原樣，不動。）

- [ ] **Step 3: 執行 typecheck**

Run: `pnpm typecheck`
Expected: 沒有錯誤（`toDateKey`、`formatDate` 型別與呼叫方式不變，`WEEKDAYS` 已不在 `index.tsx` 直接使用）

- [ ] **Step 4: 手動確認**

啟動 App（`pnpm android` 或既有的 dev client），確認數據頁頂部日期文字（如「2026 年 7 月 16 日（四）」）顯示正常，沒有跑版或報錯。

- [ ] **Step 5: Commit**

```bash
git add src/utils/date.ts "app/(tabs)/index.tsx"
git commit -m "refactor: 抽出共用日期工具 src/utils/date.ts"
```

---

### Task 2: 安裝 react-native-calendars 並建立 `DataCalendarModal` 元件

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`（透過 `pnpm add`）
- Create: `src/components/DataCalendarModal.tsx`

**Interfaces:**
- Consumes: `WEEKDAYS`、`toDateKey` from `@/utils/date`（Task 1 產出）；`useMeasurements().getMeasurements(startDate, endDate): Promise<Measurement[]>`（`src/hooks/useMeasurements.ts`，已存在，不用改）。
- Produces: `DataCalendarModal` 元件，props：
  ```ts
  type Props = {
    visible: boolean;
    selectedDate: Date;
    themeColor: string;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
  };
  ```
  給 Task 3（`index.tsx`）使用。

- [ ] **Step 1: 安裝套件**

```bash
pnpm add react-native-calendars
```

Expected: `package.json` 的 `dependencies` 新增 `"react-native-calendars": "^1.x.x"`，`pnpm-lock.yaml` 更新，安裝過程無 peer dependency 錯誤（專案 `.npmrc` 已設定 `legacy-peer-deps=true`）。

- [ ] **Step 2: 建立 `src/components/DataCalendarModal.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { useMeasurements } from '@/hooks/useMeasurements';
import { WEEKDAYS, toDateKey } from '@/utils/date';

type Props = {
  visible: boolean;
  selectedDate: Date;
  themeColor: string;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

type DayMarking = {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
};

function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getMonthRange(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split('-').map(Number);
  const start = `${monthKey}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${monthKey}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function DataCalendarModal({ visible, selectedDate, themeColor, onConfirm, onCancel }: Props) {
  const [tempDate, setTempDate] = useState(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(toMonthKey(selectedDate));
  const [markedDays, setMarkedDays] = useState<string[]>([]);

  const { getMeasurements } = useMeasurements();

  useEffect(() => {
    if (visible) {
      setTempDate(selectedDate);
      setVisibleMonth(toMonthKey(selectedDate));
    }
  }, [visible, selectedDate]);

  const loadMarkedDays = useCallback(async (monthKey: string) => {
    const { start, end } = getMonthRange(monthKey);
    const records = await getMeasurements(start, end);
    setMarkedDays(records.map((r) => r.date));
  }, [getMeasurements]);

  useEffect(() => {
    if (visible) {
      loadMarkedDays(visibleMonth);
    }
  }, [visible, visibleMonth, loadMarkedDays]);

  if (!visible) return null;

  const tempDateKey = toDateKey(tempDate);
  const markedDates: Record<string, DayMarking> = {};
  markedDays.forEach((dateKey) => {
    markedDates[dateKey] = { marked: true, dotColor: themeColor };
  });
  markedDates[tempDateKey] = {
    ...(markedDates[tempDateKey] ?? {}),
    selected: true,
    selectedColor: themeColor,
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={styles.sheet}>
          <View style={[styles.header, { backgroundColor: themeColor }]}>
            <Text style={styles.headerYear}>{tempDate.getFullYear()} 年</Text>
            <Text style={styles.headerDate}>
              {tempDate.getMonth() + 1} 月 {tempDate.getDate()} 日 週{WEEKDAYS[tempDate.getDay()]}
            </Text>
          </View>

          <Calendar
            current={`${visibleMonth}-01`}
            markedDates={markedDates}
            onDayPress={(day: DateData) => setTempDate(fromDateKey(day.dateString))}
            onMonthChange={(month: DateData) =>
              setVisibleMonth(`${month.year}-${String(month.month).padStart(2, '0')}`)
            }
            firstDay={0}
            theme={{
              todayTextColor: themeColor,
              selectedDayBackgroundColor: themeColor,
              selectedDayTextColor: '#FFFFFF',
              arrowColor: themeColor,
              monthTextColor: themeColor,
              dotColor: themeColor,
              selectedDotColor: '#FFFFFF',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={[styles.confirmText, { color: themeColor }]}>確定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerYear: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.85,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 15,
    color: '#999999',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
```

- [ ] **Step 3: 執行 typecheck**

Run: `pnpm typecheck`
Expected: 沒有錯誤（此元件尚未被任何畫面引用，但獨立檔案本身型別需正確）

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/DataCalendarModal.tsx
git commit -m "feat: 新增 DataCalendarModal 月曆元件，標記有資料的日期"
```

---

### Task 3: 把 `DataCalendarModal` 接進數據頁，並加上今日延續最新資料邏輯

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- Consumes: `DataCalendarModal` from `@/components/DataCalendarModal`（Task 2 產出，props 如上）；`useMeasurements().getLatestMeasurement(): Promise<Measurement | null>`（`src/hooks/useMeasurements.ts`，已存在）。

- [ ] **Step 1: 修改 imports，移除不再用到的 `Modal`/`Platform`/`DateTimePicker`，加入 `DataCalendarModal`**

原本：

```ts
import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { MeasurementCard } from '@/components/MeasurementCard';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { toDateKey, formatDate } from '@/utils/date';
```

改成：

```ts
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
```

- [ ] **Step 2: 移除 `tempDate` state，改抓 `getLatestMeasurement`**

原本：

```ts
const [selectedDate, setSelectedDate] = useState(new Date());
const [tempDate, setTempDate] = useState(new Date());
const [showPicker, setShowPicker] = useState(false);
const [measurement, setMeasurement] = useState<Measurement | null>(null);

const { getMeasurement } = useMeasurements();
```

改成：

```ts
const [selectedDate, setSelectedDate] = useState(new Date());
const [showPicker, setShowPicker] = useState(false);
const [measurement, setMeasurement] = useState<Measurement | null>(null);

const { getMeasurement, getLatestMeasurement } = useMeasurements();
```

- [ ] **Step 3: `loadMeasurement` 加上「今天無資料時延續最新資料」邏輯**

原本：

```ts
const loadMeasurement = useCallback(async () => {
  const m = await getMeasurement(dateKey);
  setMeasurement(m);
}, [dateKey, getMeasurement]);
```

改成：

```ts
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
```

- [ ] **Step 4: 簡化 `openPicker`**

原本：

```ts
const openPicker = () => {
  setTempDate(selectedDate);
  setShowPicker(true);
};
```

改成：

```ts
const openPicker = () => {
  setShowPicker(true);
};
```

- [ ] **Step 5: 用 `DataCalendarModal` 取代 iOS/Android 兩段日期選擇器程式碼**

原本（緊接在 `</ScrollView>` 之後、`</SafeAreaView>` 之前）：

```tsx
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
```

改成：

```tsx
      {/* ── 日期選擇月曆 ── */}
      <DataCalendarModal
        visible={showPicker}
        selectedDate={selectedDate}
        themeColor={themeColor}
        onConfirm={(date) => { setSelectedDate(date); setShowPicker(false); }}
        onCancel={() => setShowPicker(false)}
      />
```

- [ ] **Step 6: 移除 `StyleSheet` 中不再使用的舊 picker 樣式**

在檔案底部 `styles` 物件中，刪除以下已不再使用的 key（現在都搬到 `DataCalendarModal.tsx` 裡了）：`modalOverlay`、`pickerSheet`、`pickerHeader`、`pickerCancel`、`pickerConfirm`。連同它們上面的 `// Date picker modal (iOS)` 註解一併刪除。

- [ ] **Step 7: 執行 typecheck**

Run: `pnpm typecheck`
Expected: 沒有錯誤（無未使用的 import／變數，`DataCalendarModal` props 型別吻合）

- [ ] **Step 8: 手動驗證（模擬器或實機）**

1. 清空今天的紀錄（若有測試資料，先用「編輯」刪除今天的資料，或直接用一個目前還沒量測的新日期測試），確認開啟數據頁時顯示的是最近一次的資料，而不是空白。
2. 用右下角「＋」新增今天的資料，確認送出後數據頁立即顯示今天的新資料。
3. 點左上角日期，開啟月曆，確認當月有資料的日期下方有標記圓點。
4. 點一個有標記的日期 → 按「確定」，確認畫面切換成該天的實際資料。
5. 點一個沒有標記（無資料）的日期 → 按「確定」，確認畫面顯示空白（不延續）。
6. 用月曆左右箭頭切換月份，確認標記圓點正確隨月份更新。
7. 按「取消」，確認選取的日期不變、月曆關閉。
8. iOS 與 Android 兩平台都要各測一次（可用 `pnpm ios` / `pnpm android`）。

- [ ] **Step 9: Commit**

```bash
git add "app/(tabs)/index.tsx"
git commit -m "feat: 數據頁今日無資料時延續最新資料，並改用月曆標記有資料日期"
```

---

## Self-Review Notes

- **Spec coverage**：需求 1（今日延續最新資料，其他日期不延續）→ Task 3 Step 3；需求 2（月曆標記有資料日期）→ Task 2；需求 3（點選標記日期後顯示該天資料）→ Task 2（`onDayPress`/`markedDates`）+ Task 3 Step 5（`onConfirm` 觸發 `loadMeasurement`）。皆有對應任務。
- **Placeholder scan**：三個任務皆為完整程式碼，無 TBD/TODO。
- **Type consistency**：`DataCalendarModal` props（`visible`/`selectedDate`/`themeColor`/`onConfirm`/`onCancel`）在 Task 2 定義、Task 3 呼叫端完全一致；`toDateKey`/`formatDate`/`WEEKDAYS` 在 Task 1 匯出、Task 2、Task 3 的 import 名稱一致。
