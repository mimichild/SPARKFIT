# 數據頁：延續最新資料 + 月曆標記有資料日期

**日期**: 2026-07-16
**狀態**: 已核准，待寫實作計畫

## 背景

數據頁（`app/(tabs)/index.tsx`）目前若「選到的日期」沒有紀錄，所有欄位顯示空白／`──`。使用者每天打開 App 若當天還沒量測，就會看到一整頁空白，體驗不佳。

另外，頁面左上角日期點下去後，iOS 用 `DateTimePicker` spinner、Android 用系統原生 `DateTimePicker`（`display="default"`）。原生元件無法客製化標記「哪些日期有資料」，使用者無從得知哪天有記錄可以回顧。

## 需求

1. **今天無資料時延續顯示最新一次資料**：只有「今天」這個特定情境套用延續邏輯；透過月曆手動選到的其他日期若無資料，維持顯示空白（不延續）。
2. **月曆標記有資料的日期**：點開左上角日期後跳出的月曆，須標記出當月有資料的日期，方便使用者點選查看。
3. 使用者點選某個有標記的日期並確認後，該天的資料要顯示出來。

## 設計

### 1. 「延續最新資料」邏輯（僅限今天）

在 `app/(tabs)/index.tsx` 的 `loadMeasurement()` 中：
- 先用 `getMeasurement(dateKey)` 查詢 `selectedDate` 當天的紀錄。
- 若查無紀錄，且 `selectedDate` 是**今天的實際日期**（用 `toDateKey(new Date())` 比對），改呼叫 `useMeasurements` 既有的 `getLatestMeasurement()`（`ORDER BY date DESC LIMIT 1`）取得最近一次的資料並顯示。
- 若 `selectedDate` 不是今天（使用者透過月曆手動選了其他日期）且查無紀錄，維持顯示空白，行為不變。
- 不需要额外標示「這是延續的舊資料」（使用者確認不需要）。
- 一旦使用者為今天新增資料，`getLatestMeasurement()` 自然會回傳當天資料，無需額外邏輯處理「新資料覆蓋延續資料」的情境。

### 2. 月曆元件與資料標記

- 新增依賴 `react-native-calendars`。
- 新增元件 `src/components/DataCalendarModal.tsx`，取代 `index.tsx` 中原本 iOS（`Modal` + spinner）與 Android（原生 `display="default"`）兩段日期選擇程式碼。`report.tsx` 中另一處 `DateTimePicker` 用法不受影響，維持原樣。
- **外觀**：比照現有設計語言（`pickerSheet` 樣式、`themeColor` 主題色）：
  - 頂部深色標題區（背景色用 `themeColor`）：顯示「YYYY 年」「M 月 D 日 週X」。
  - 下方月份列（‹ 月份年份 ›）+ 星期列（日一二三四五六）+ 7×6 日期格。
  - 底部「取消」「確定」按鈕，樣式沿用現有 `pickerCancel` / `pickerConfirm`。
- **資料標記**：Modal 開啟或月份切換時，用既有的 `getMeasurements(startDate, endDate)` 查詢當月範圍，將有紀錄的日期整理成 `react-native-calendars` 的 `markedDates`（`{ [dateKey]: { marked: true, dotColor: themeColor } }`），在該日期格下方顯示小圓點。
- **選取行為**：
  - 點日期格 → 該日期格圓形反白（暫存選取，尚未套用）。
  - 按「確定」→ 呼叫 `onConfirm(date)`，父層更新 `selectedDate`、關閉 Modal、觸發 `loadMeasurement()`。
  - 按「取消」→ 呼叫 `onCancel()`，關閉 Modal，不改動原本的 `selectedDate`。
  - 點沒有標記（無資料）的日期一樣可以選取、確認，套用後顯示空白（符合需求 1 的「非今天不延續」原則）。
- 月份切換用 `react-native-calendars` 內建的左右箭頭，跨月／閏年由套件處理，不用手刻。

### 3. 元件介面與資料流

```
DataCalendarModal props:
  visible: boolean
  selectedDate: Date
  themeColor: string
  onConfirm: (date: Date) => void
  onCancel: () => void
```

- `DataCalendarModal` 是受控元件，內部僅管理「當月月份」與「暫存選取日期」這兩個 UI 狀態，以及對應的 `markedDates` 查詢結果（`useState` + `useEffect`，隨月份切換重新查詢 `getMeasurements`）。
- `index.tsx` 原本的 `showPicker` / `tempDate` 狀態改為由 `DataCalendarModal` 內部狀態取代；`index.tsx` 只需保留 `selectedDate` 與 `showPicker`（是否顯示 Modal）。
- `Platform.OS` 判斷區塊（iOS Modal + spinner、Android 原生 picker）整段移除，統一改用 `DataCalendarModal`，兩平台體驗一致。

### 4. 錯誤處理

- `getLatestMeasurement()` / `getMeasurements()` 查無資料時回傳 `null` / `[]`，維持現有 hook 的處理方式，不新增額外 try/catch（沿用專案現有慣例，`useMeasurements.ts` 目前也沒有額外的錯誤防禦）。
- 查詢失敗或無資料時，月曆單純不標記任何日期，不影響選取與確認操作。

### 5. 測試（手動驗證，專案無自動化測試框架）

1. 今天無資料 → 開啟數據頁應顯示最近一次的資料（非空白）。
2. 新增今天的資料後 → 頁面顯示今天的新資料。
3. 開啟月曆 → 當月有資料的日期應顯示標記圓點。
4. 點選有標記的日期 → 按確定後應顯示該天實際資料。
5. 點選沒有標記（無資料）的日期 → 按確定後顯示空白。
6. 切換月份（上一頁/下一頁）→ 標記圓點正確隨月份更新。
7. iOS 與 Android 兩平台皆需驗證月曆外觀與操作一致。

## 範圍外

- 不在畫面上額外提示「此為延續之前的資料」文字。
- 不處理 `report.tsx` 中另一個 `DateTimePicker` 的使用。
- 不新增任何自動化測試（沿用專案現況，僅手動驗證）。
