# 進度日誌

<!-- 寫法與完整範例見 docs/harness/PLAYBOOK.md §5。
     規則：新的工作階段記錄插在「## 工作階段日誌」標題正下方（最新在最上面），編號遞增。
     「目前已驗證狀態」每次收尾都要更新，永遠反映最新事實。 -->

## 目前已驗證狀態

- 儲存庫根目錄：/Users/mimi/Documents/SPARKFIT
- 標準啟動路徑：`RUN_START_COMMAND=1 ./init.sh`（實際指令見 init.sh 的 START_CMD）
- 標準驗證路徑：./init.sh（pnpm install + pnpm test；2026-07-23 為 24 tests passed；另有 pnpm typecheck）
- 目前最高優先級未完成功能：無（feature_list.json 目前全部 passing）
- 目前 blocker：無
- 背景：Apple Developer Program 已生效（2026-07-20）；ios-001～ios-009、test-001 皆已 passing；App icon 加了描邊解決對比度偏軟問題並實機確認；已設定 EAS Update（OTA）支援；eas.json 補上 appVersionSource remote／autoIncrement／ascAppId；報告頁日期選擇器統一成跟數據頁一樣的月曆樣式；修好「清空紀錄仍在月曆顯示紅點」的資料查詢 bug；新增真正的刪除單日紀錄功能（垃圾桶圖示＋二次確認，iOS/Android 共用）

## 工作階段日誌

### 工作階段 011

- 日期：2026-07-23
- 本輪目標：新增刪除單日紀錄功能（跟使用者討論「清空欄位」跟「真正刪除」的差異後決定要加）
- 已完成：
  - `src/hooks/useMeasurements.ts` 新增 `deleteMeasurement(date)`，真正的 SQL DELETE（不是清空後 UPDATE）
  - `app/add-data.tsx` 編輯模式（`mode === 'edit'`）的 header 加垃圾桶圖示（Ionicons `trash-outline`），點下去用 `Alert.alert` 二次確認（destructive 樣式），確認後刪除並返回上一頁
  - 跨平台通用，iOS/Android 共用同一份程式碼，沒有平台分支
  - 模擬器實測：垃圾桶圖示正常顯示、確認對話框正常跳出、刪除後資料真的消失且月曆無紅點
- 執行過的驗證：`pnpm test`（24 tests passed，新增 1 個測試）、`tsc --noEmit`、模擬器手動操作
- 已擷取證據：見 feature_list.json ios-009 evidence
- 提交記錄：（本輪 commit）
- 已知風險或未解決問題：無
- 下一步最佳動作：feature_list.json 全部 passing；接著要出一版新 APK 給使用者測試；長期主線是回到「先在 SPARKWEAR 接 AdMob+RevenueCat 當範本」的付費功能

### 工作階段 010

- 日期：2026-07-23
- 本輪目標：(1) 報告頁日期選擇器改成跟數據頁一致的月曆樣式；(2) 使用者回報並順手修好「清空紀錄仍顯示紅點」的 bug
- 已完成：
  - `app/(tabs)/report.tsx` 的三個日期按鈕（單日、區間開始、區間結束）從 `@react-native-community/datetimepicker` 滾輪式選擇器改成複用既有的 `DataCalendarModal` 元件，移除相關的 Platform 分支與 pickerSheet 系列樣式
  - 過程中本機 Android 建置（幫使用者出一版 APK 測試）踩到 Gradle Metaspace OOM（`:expo-updates:kspReleaseKotlin` 失敗），把 `android/gradle.properties` 的 `MaxMetaspaceSize` 從 512m 加大到 1024m 解決，這是 expo-updates 這次新增的 KSP 註解處理需要更多記憶體
  - 使用者實機/模擬器測試時發現：7/15、7/16 之前清空過的測試資料，月曆上仍顯示紅點，點進去卻是空的。查出根因：`src/hooks/useMeasurements.ts` 的 `getMeasurement()`／`getMeasurements()` 沒有套用既有的 `HAS_DATA_CONDITION`（用來判斷「這筆紀錄是否真的有資料」），導致「清空後留下的全 null 列」被當成有效紀錄查出來。兩個函式的 SQL 都補上這個條件，讓整個 hook 對「一筆紀錄」的定義保持一致
  - 用 sqlite3 直接插入一筆模擬情境的空紀錄重現 bug，確認修復後月曆正確不再顯示該日期的紅點
- 執行過的驗證：`pnpm test`（23 tests passed，含新增 2 個測試）、`tsc --noEmit`、模擬器手動操作、sqlite3 直接重現與驗證
- 已擷取證據：見 feature_list.json ios-007／ios-008 evidence
- 提交記錄：（本輪 commit）
- 已知風險或未解決問題：無
- 下一步最佳動作：feature_list.json 全部 passing，無待辦項目；下一步是回到「先在 SPARKWEAR 接 AdMob+RevenueCat 當範本」的付費功能主線

### 工作階段 009

- 日期：2026-07-22
- 本輪目標：把 ios-006 icon 修復實際出貨到 TestFlight 並實機確認
- 已完成：
  - 設定 EAS Update（OTA）支援；eas.json 加 `ascAppId`
  - `eas build` + `eas submit` 連續兩次失敗（Something went wrong，籠統錯誤），查出兩個根因：
    1. 描邊指令（`magick ... -draw "circle ..."`）意外把 `icon.png` 轉成帶 alpha 通道的 RGBA，Apple 不接受帶透明通道的 App icon；用 `-alpha off` 攤平回 Truecolor 解決
    2. `eas.json` 原本完全沒有 `appVersionSource`/`autoIncrement`，導致每次建置的 build number 都固定是 1，跟當天稍早 ios-005 就已經上傳過的 Build 1 衝突；補上這兩個設定後 build number 正確遞增到 2
  - 兩個問題都修好後重新 `eas build` + `eas submit`（Build 2）成功 → 使用者在 App Store Connect 加入測試群組 → iPhone TestFlight 安裝
  - 使用者實機確認「現在看起來都正常了」
- 執行過的驗證：`./init.sh`（21 tests passed）、實機 TestFlight 圖示確認、eas submit 成功上傳
- 已擷取證據：見 feature_list.json ios-006 evidence
- 提交記錄：（本輪 commit）
- 已知風險或未解決問題：無
- 下一步最佳動作：feature_list.json 全部 passing，無待辦項目

### 工作階段 008

- 日期：2026-07-22
- 本輪目標：修 ios-006（App icon 桌面顯示偏模糊）
- 已完成：
  - 跟使用者確認處理方向：選擇「加一圈描邊」（跟 SPARKPLATE 同款風格），不是重新設計整張圖示
  - 用 ImageMagick 量測 SPARKPLATE icon.png 的描邊粗細/顏色（約 4-6px、灰色 rgb(150~185) 範圍）當參考，量出 SPARKFIT 圓形的圓心（512,512）與半徑（約 458px），畫一圈對應風格的灰色描邊
  - `npx expo prebuild --platform ios` 重新產生資源，確認 iOS icon 資源已更新成加了描邊的版本
  - 順便確認 SPARKFIT 的 icon.png 本身乾淨，沒有 SPARKSHAPE 那種背景棋盤格殘留問題
  - Android 的 adaptiveIcon 用另一張獨立檔案，這次沒有動（使用者反映的是 iPhone 桌面圖示，範圍以外）
- 執行過的驗證：`./init.sh`（21 tests passed）、prebuild 產出檔案視覺比對
- 已擷取證據：見 feature_list.json ios-006 evidence
- 提交記錄：（本輪 commit）
- 已知風險或未解決問題：無
- 下一步最佳動作：feature_list.json 目前全部 passing，無待辦項目

### 工作階段 007

- 日期：2026-07-21
- 本輪目標：完成 ios-005（TestFlight 內部測試）剩餘步驟——加入測試群組＋實機驗證
- 已完成：
  - 使用者於 App Store Connect 把 Build 1 加入內部測試群組，iPhone 用 TestFlight 成功安裝並開啟 SPARKFIT
  - 實機重跑核心流程（新增身體數據紀錄、圖表頁、日曆頁、關閉重開確認資料持久化），使用者確認「測試都沒有問題」
  - 使用者反映 icon 看起來比較軟，查證是來源檔案 1024x1024、邊緣反鋸齒僅 1-2px（非解析度問題），純屬設計上沒有描邊；使用者決定不處理
- 執行過的驗證：見上述，皆為使用者實機手動操作＋圖檔查證
- 已擷取證據：見 feature_list.json ios-005 evidence
- 提交記錄：（本輪 commit）
- 已知風險或未解決問題：無
- 下一步最佳動作：目前 feature_list.json 全部 passing，無待辦項目；有新需求再開新 feature

### 工作階段 006

- 日期：2026-07-21
- 本輪目標：ios-005 中不需要實機的部分先做完（eas submit）
- 已完成：使用者於 Terminal.app 互動執行 `eas submit --platform ios --profile production --latest`，Build fd46f40f-3032-4944-bab2-dd5ad09c475f 上傳成功
- 執行過的驗證：實際跑 eas submit，看到「Submitted your app to Apple App Store Connect!」完成訊息
- 已擷取證據：見 feature_list.json ios-005 evidence
- 提交記錄：ca6bafa
- 已知風險或未解決問題：ios-005 剩餘兩步需要使用者的實體 iPhone
- 下一步最佳動作：等使用者有 iPhone 可測時，完成 ios-005 剩餘步驟

### 工作階段 005

- 日期：2026-07-20
- 本輪目標：完成 ios-004（EAS iOS 雲端建置成功）
- 已完成：補齊 eas.json 的 iOS profile（原本只有 Android）並套上 Node 22.13.0 修法；`eas init` 建立 EAS 專案；`eas build --platform ios --profile production`（互動模式）一次就成功
- 執行過的驗證：實際跑 EAS 雲端建置，一次成功
- 已擷取證據：見 feature_list.json ios-004 evidence，含 build URL 與 .ipa 下載連結
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：無新增
- 下一步最佳動作：開始 ios-005（TestFlight 內部測試，需要實體 iPhone）

### 工作階段 004

- 日期：2026-07-20
- 本輪目標：完成 test-001（建立基礎單元測試，讓基準驗證回到 pnpm test）
- 已完成：新增 3 個測試檔（date.test.ts、settingsStore.test.ts、useMeasurements.test.ts），共 21 個測試，涵蓋純函數（日期格式化）、zustand store setter、SQLite 服務層 hook 的 SQL 語句與參數正確性；`init.sh` 的 `VERIFY_CMD` 從 `pnpm typecheck` 改回 `pnpm test`
- 執行過的驗證：`pnpm test`（21 passed）、`pnpm typecheck`（無錯誤）、`./init.sh`
- 已擷取證據：見 feature_list.json test-001 evidence
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：useBackup.ts（匯出/匯入 hook）尚未寫測試，牽涉較多原生模組（FileSystem/Sharing/DocumentPicker/Alert），優先度較低，之後有餘力可以補
- 下一步最佳動作：等使用者申請好 Apple Developer Program 後才能繼續 ios-004

### 工作階段 003

- 日期：2026-07-20
- 本輪目標：完成 ios-002（模擬器驗證核心流程：資料庫讀寫、圖表與日曆渲染）
- 已完成：新增一筆身體數據紀錄，「數據」頁與「報告」頁（圖表）皆正常渲染無紅屏；sqlite3 直接查容器內 sparkfit.db 確認寫入成功；完全關閉 App 重開後資料仍在
- 執行過的驗證：模擬器手動操作＋sqlite3 直接查詢資料庫內容＋simctl terminate/launch 持久化測試
- 已擷取證據：見 feature_list.json ios-002 evidence；截圖 docs/ios-002-chart-calendar.png、docs/ios-002-restart-persist.png
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：無新增
- 下一步最佳動作：test-001（建立基礎單元測試）——這個排在 ios-004 之前，照優先順序應該先做

### 工作階段 002

- 日期：2026-07-20
- 本輪目標：完成 ios-001（本專案第一次 iOS 模擬器建置）
- 已完成：`npx expo run:ios` 第一次執行（含 prebuild），Build Succeeded，首頁正常渲染，無紅屏；跟 SPARKPLATE/SPARKSHAPE 不同，沒有踩到 RCTBridge/fmt 相關的原生層編譯問題
- 執行過的驗證：模擬器手動建置＋截圖
- 已擷取證據：見 feature_list.json ios-001 evidence；截圖 docs/ios-001-simulator-home.png
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：無新增
- 下一步最佳動作：開始 ios-002（模擬器驗證核心流程：資料庫讀寫、圖表與日曆渲染）

### 工作階段 001

- 日期：2026-07-17
- 本輪目標：導入 harness-engineering 工作流（/harness-init）
- 已完成：安裝 harness 範本；init.sh 設定為 pnpm（無測試檔，暫用 typecheck 當基準驗證並已告知使用者）；寫入 5 項功能（含 test-001 建立基礎測試）
- 執行過的驗證：./init.sh
- 已擷取證據：見下方工作階段記錄與 git commit
- 提交記錄：chore: 導入 harness-engineering 工作流（本輪 commit）
- 已知風險或未解決問題：沒有測試，基準驗證只有 typecheck，迴歸偵測能力弱（test-001 解決）；ios-004/005 依賴 Apple Developer 帳號
- 下一步最佳動作：開始 ios-001（先照 SPARKWEAR/docs/ios-testing/README.md 確認本機環境）
