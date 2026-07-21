# 進度日誌

<!-- 寫法與完整範例見 docs/harness/PLAYBOOK.md §5。
     規則：新的工作階段記錄插在「## 工作階段日誌」標題正下方（最新在最上面），編號遞增。
     「目前已驗證狀態」每次收尾都要更新，永遠反映最新事實。 -->

## 目前已驗證狀態

- 儲存庫根目錄：/Users/mimi/Documents/SPARKFIT
- 標準啟動路徑：`RUN_START_COMMAND=1 ./init.sh`（實際指令見 init.sh 的 START_CMD）
- 標準驗證路徑：./init.sh（pnpm install + pnpm test；2026-07-20 為 21 tests passed；另有 pnpm typecheck）
- 目前最高優先級未完成功能：無（feature_list.json 目前全部 passing）
- 目前 blocker：無
- 背景：Apple Developer Program 已生效（2026-07-20）；ios-001～ios-005、test-001 皆已 passing（含 TestFlight 實機驗證），EAS 雲端建置成功產出 .ipa；App icon 因無描邊視覺上較軟，使用者確認不處理

## 工作階段日誌

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
