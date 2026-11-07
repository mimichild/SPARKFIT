# 進度日誌

<!-- 寫法與完整範例見 docs/harness/PLAYBOOK.md §5。
     規則：新的工作階段記錄插在「## 工作階段日誌」標題正下方（最新在最上面），編號遞增。
     「目前已驗證狀態」每次收尾都要更新，永遠反映最新事實。 -->

## 目前已驗證狀態

- 儲存庫根目錄：/Users/mimi/Documents/SPARKFIT
- 標準啟動路徑：`RUN_START_COMMAND=1 ./init.sh`（實際指令見 init.sh 的 START_CMD）
- 標準驗證路徑：./init.sh（pnpm install + pnpm test；2026-07-23 為 41 tests passed；另有 pnpm typecheck）
- monetization-001：passing；AdMob／RevenueCat 已設定並**已實機驗證購買成功**（RevenueCat 官方事故已於 7/31 解決）；順帶修好 `useProGate.ts` 一個真實 bug（見工作階段 019）
- appstore-001：passing（但 App 仍未上架，Apple 審查持續拉鋸中）；proactively 修復訂閱付費畫面缺 Apple Guideline 3.1.2(c) 必要資訊（跟 SPARKSHAPE 被拒的原因同一套範本缺口），Build 4 重新送審後 2026-08-10 收到新一輪拒絕——**Guideline 2.1 Information Needed**（非文案/程式碼問題，同一天 SPARKPLATE/SPARKSHAPE 也收到一樣的拒絕原因）：Apple 要求在「App 審查資訊→備註」補充裝置清單、App 說明、外部服務清單、地區差異、IAP 導覽方式，並附上實體裝置螢幕錄影；2026-08-19 使用者用 iPhone 17 錄了螢幕錄影（`assets/images/ScreenRecording_08-19-2026 13-07-55_1.mp4`，涵蓋主畫面啟動、核心功能瀏覽含新增數據表單、實際點「訂閱」跳出購買確認彈窗後安全取消兩次），Claude 用 ffmpeg 壓縮到 3.9MB、寫好備註文字並上傳，已重新提交至 App 審查，狀態變成「等待審查」
- **2026-09-22 重大變更：App 已遷移到全新 bundle ID `com.sparkscale.app` / 全新 Apple ID `6814699374`**（舊 Apple ID `6793043215`、舊 bundle `com.sparkfit.app` 已棄用但保留，改名為「SPARK SCALE（舊）」）。根因：舊記錄因先前工作階段只改了 App 顯示名稱，底層 bundle ID 仍是 `com.sparkfit.app`，被 Apple Guideline 4.1(a) Copycat 判定與其他已上架 App 撞名而反覆拒絕；bundle ID 建立後不可變更，故整套遷移到新 App 記錄（含新 RevenueCat App 綁定、新 Public API Key `appl_LdlUdHizyufsAJLaTjgsasWaiQI`）。`app.json`/`eas.json`/`src/constants/monetization.ts` 皆已改用新值並已 build+submit 成功。App Store Connect 新記錄的 App 資訊、中英文 Store 描述、截圖、隱私權政策 URL（逐 locale）、訂閱群組與兩個訂閱項目皆已搬遷完成，已合併提交（App 版本+訂閱群組+2 個訂閱項目共 4 項）並顯示「已提交 4 個項目」，狀態為「正在等待審查」
- 2026-08-13：使用者要求把 App Store Connect 的繁體中文「App 資訊」名稱（App Store 上架顯示名稱）改為「SPARK FIT心動身形」（依使用者指定字串，FIT 與心動之間無空格），已在後台存檔成功；App 當時狀態為「正在等待審查」，純文案修改不影響排隊、不需重新提交，儲存後狀態仍維持「正在等待審查」
- 2026-11-07：body-001 passing——身體組成改為體脂率／內臟脂肪等級／腰臀比／體脂肪量／去脂體重（自動算）／基礎代謝率／BMI（自動算），新增 calf（小腿圍）DB 欄位
- 2026-11-07：body-002 passing——腰臀比自動值存 DB；同日重複新增會詢問覆蓋並可逐項比對新舊資料
- 2026-11-07：body-003 passing——新增骨骼肌量、下胸圍（DB 欄位）、腰高比、FFMI（自動算），首頁數據 (?) 說明
- 目前最高優先級未完成功能：無（下一輪從 feature_list.json 選下一個 not_started 功能；appstore-001 已 passing，等待 Apple 審查結果非我方可控）
- 目前 blocker：無
- 背景：Apple Developer Program 已生效（2026-07-20）；ios-001～ios-009、test-001 皆已 passing；App icon 加了描邊解決對比度偏軟問題並實機確認；已設定 EAS Update（OTA）支援；eas.json 補上 appVersionSource remote／autoIncrement／ascAppId；報告頁日期選擇器統一成跟數據頁一樣的月曆樣式；修好「清空紀錄仍在月曆顯示紅點」的資料查詢 bug；新增真正的刪除單日紀錄功能（垃圾桶圖示＋二次確認，iOS/Android 共用）
- Android release APK 本地建置已知隱患：`android/`（gitignored、由 `expo prebuild` 產生）曾長期未跟著 `app.json` 更新重新生成，導致累積 3 個潛在問題（AdMob meta-data 缺失、splash 缺 image、`softwareKeyboardLayoutMode` 值不合法），已於工作階段 020 全部修掉並改成每次本地建置前先 `rm -rf android && npx expo prebuild --platform android` 再 `assembleRelease`，避免舊 native 專案殘留

## 工作階段日誌

### 工作階段 029

- 日期：2026-11-07
- 本輪目標：body-003——新增骨骼肌量、下胸圍、腰高比、FFMI；首頁數據名稱加 (?) 說明
- 已完成：
  - 新增 SQLite 欄位 skeletal_muscle、underbust（DBProvider 改為 ADDED_COLUMNS 迴圈補欄位）；存檔、HAS_DATA_CONDITION、備份匯入、DAILY_FIELDS（同日合併/比對）皆納入
  - bodyMetrics 新增 calcWaistHeightRatio（腰圍÷身高，2 位）、calcFfmi（去脂體重÷身高²，1 位），顯示時即時計算不存 DB
  - 新增 `src/constants/metricInfo.ts`（首頁項目順序＋每項說明文字）、`src/components/MetricInfoModal.tsx`；MeasurementCard 加 onInfoPress 顯示灰色 (?)；首頁改由陣列渲染
  - 新增數據頁、報告頁折線圖選項同步新增四項；新增數據空值顯示改為全形「＿」（工作階段 028 後追加）
- 執行過的驗證：`pnpm test`（105 passed）、`pnpm typecheck`、`./init.sh`
- 已擷取證據：見 feature_list.json body-003 evidence
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：尚未在實機目視確認新版面與說明視窗；尚未重新建置 APK（含全形「＿」與本輪內容）
- 下一步最佳動作：使用者要求時建置 APK 上傳 Drive `SPARK-Builds/SPARK SCALE/`

### 工作階段 028

- 日期：2026-11-07
- 本輪目標：建置 Android APK 上傳 Google Drive；調查使用者回報「更新後舊資料不見」；新增數據頁空值顯示改為「_」
- 已完成：
  - 本地 release APK 建置：`rm -rf android && expo prebuild` 後 Gradle 因 `OutOfMemoryError: Metaspace` 卡住（預設 jvmargs -Xmx2048m / Metaspace 512m）；改 `android/gradle.properties` 為 `-Xmx4096m -XX:MaxMetaspaceSize=1536m` 後建置成功，上傳至 Drive `SPARK-Builds/SPARK SCALE/sparkscale-v1.0.0-20261107-1403-body-composition.apk`（新資料夾，舊 APK 在 `SPARKFIT/`）
  - 資料遺失調查：程式碼端只有新增 calf 欄位，無刪除動作，DB 檔名 sparkfit.db 未變；根因判斷為 Android 套件 ID 變更——Drive `SPARKFIT/` 內舊 APK（最新 8/21）為 `com.sparkfit.app`，9/22 遷移後新 APK 為 `com.sparkscale.app`，Android 視為不同 App 另外安裝，新 App 為空白；舊資料應仍在舊 App 內（除非使用者已解除安裝舊 App）
  - 新增數據/修改數據頁空值 placeholder 與自動計算欄位空值由「──」改為「_」（先寫失敗測試）
- 執行過的驗證：`pnpm test`（89 passed）、`pnpm typecheck`；APK 上傳後確認 Drive item-id xattr 存在
- 已知風險或未解決問題：等使用者確認手機上是否仍有舊 com.sparkfit.app；匯出備份需 Pro，若舊 App 無法匯出，可考慮以舊套件 ID + 同一 debug keystore 建置覆蓋更新舊 App 以取得匯出；`android/gradle.properties` 記憶體設定會在下次 prebuild 被覆蓋
- 下一步最佳動作：依使用者回覆協助搬移舊資料；把 Gradle 記憶體設定寫入 app.json（expo-build-properties 或 config plugin）
- 補充（同日稍後）：
  - 資料遺失已解決：確認 8/21 的 APK 建於改名（03469d8）之後，舊 App 名稱/圖示同為「SPARK SCALE」但套件 ID 為 com.sparkfit.app，手機上兩個 App 外觀完全相同；使用者已從舊 App 匯出、匯入新 App（com.sparkscale.app），舊 App 暫時保留待確認
  - 新增 `plugins/withGradleMemory.js` config plugin（寫入 app.json plugins），每次 prebuild 自動把 org.gradle.jvmargs 設為 -Xmx4096m -XX:MaxMetaspaceSize=1536m
  - 重新建置 APK（含「_」空值顯示）上傳 Drive `SPARK-Builds/SPARK SCALE/`

### 工作階段 027

- 日期：2026-11-07
- 本輪目標：body-002——腰臀比自動值存入 DB；同日重複按「＋」詢問覆蓋並可逐項比對
- 已完成：
  - 腰臀比：存檔時手填優先，否則存腰圍÷臀圍自動值；修改模式下自動值不放進輸入框，腰臀圍一改就重算；合併時舊值若為手填則保留
  - 新增 `src/utils/measurementMerge.ts`（DAILY_FIELDS、diffWithExisting、mergeIntoExisting、isAutoWaistHipRatio、finalWaistHipRatio）
  - add-data：新增模式且當天已有紀錄 → Alert「已有填寫資料」；「是」只覆蓋有填欄位；「否」顯示新舊差異區塊，逐項選舊/新後再儲存（不再詢問）
  - code-reviewer 找到 1 HIGH + 2 MEDIUM（見 feature_list body-002 evidence），皆先寫失敗測試再修正
- 執行過的驗證：`pnpm test`（88 passed）、`pnpm typecheck`、`./init.sh`
- 已擷取證據：見 feature_list.json body-002 evidence
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：尚未在模擬器目視確認差異區塊與 Alert 版面；差異區塊在按「否」當下算一次，之後手動改欄位時籌碼上的「新」值不會更新（存檔仍以表單為準）
- 下一步最佳動作：模擬器/實機操作確認 body-001、body-002 新畫面

### 工作階段 026

- 日期：2026-11-07
- 本輪目標：body-001——身體組成項目改版＋新增小腿圍
- 已完成：
  - 身體組成（新增數據頁、首頁、報告頁單日卡片與區間折線圖選項）改為：體脂率／內臟脂肪等級／腰臀比／體脂肪量／去脂體重／基礎代謝率／BMI；移除肌肉重、骨量、體年齡的畫面（資料庫值保留、存檔原值帶回）
  - 新增 `src/utils/bodyMetrics.ts`：BMI = 體重 ÷ 身高²（用設定裡目前身高，所有紀錄顯示時即時重算）；去脂體重 = 體重 − 體脂肪量（沒有體脂肪量時用體脂率推算），兩者在表單上顯示為自動計算、不可手填
  - 經使用者同意新增 SQLite 欄位 `calf`（小腿圍），`DBProvider` 用 PRAGMA table_info 檢查後 ALTER TABLE，舊安裝升級不影響既有資料；儲存、HAS_DATA_CONDITION、備份匯入皆已納入
  - 身體尺寸在大腿圍旁新增小腿圍，報告折線圖可選
  - 使用者追加：腰臀比預設自動用腰圍÷臀圍計算（自動值不存 DB、腰臀圍改了會跟著變），也可手填覆蓋；腰臀比卡片/報告顯示小數 2 位
  - code-reviewer 審查後修正：沒有身高時存檔不再清空原本存的 BMI；體脂肪量 > 體重時去脂體重回傳空值而非負數
- 執行過的驗證：`pnpm test`（69 passed）、`pnpm typecheck`（無錯誤）、`./init.sh`
- 已擷取證據：見 feature_list.json body-001 evidence
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：尚未在模擬器目視確認新畫面；首頁「＋」覆蓋問題已於工作階段 027（body-002）處理
- 下一步最佳動作：模擬器/實機確認新版面；視使用者意願修首頁「＋」覆蓋問題；改動全在 JS 層（含 migration），可用 EAS Update 推送或隨下一版 build

### 工作階段 025

- 日期：2026-09-22
- 本輪目標：使用者回報 SPARK SCALE（舊 Apple ID 6793043215）「一直沒有審核」，查明原因並修復
- 已完成：
  - 查明並非單純審核延遲，是兩個問題疊加：(1) 3.1.2(c) 英文 locale App 描述仍缺 EULA 連結（跟 SPARKLOG 第六輪拒絕同一套範本漏洞，只修了繁中）；(2) Guideline 4.1(a) Copycat——App 顯示名稱雖已在工作階段 024 改成 SPARK SCALE，但 `bundleIdentifier`/`package` 仍是 `com.sparkfit.app`，Apple 人工審查員檢查底層 bundle ID 判定與其他已上架 App 撞名
  - 先與使用者確認分階段處理：本輪先修 EULA 送審一輪當診斷，bundle ID 暫緩
  - 使用者後續主動要求「也要修改 Bundle ID」，確認新 bundle ID 命名為 `com.sparkscale.app`，並授權一次做完整套遷移，僅在真正需要人工操作處才停下確認
  - 執行完整遷移：
    1. Apple Developer Portal 註冊新 identifier `com.sparkscale.app`
    2. 嘗試建立新 App Store Connect App 記錄時因中/英文名稱與舊記錄衝突失敗兩次，改名舊記錄（繁中「SPARK SCALE（舊）」、英文「SPARK SCALE (Old)」）釋放名稱後成功建立新記錄（Apple ID **6814699374**）
    3. `app.json`（iOS/Android bundle）、`eas.json`（`ascAppId`）、`src/constants/monetization.ts`（`REVENUECAT_API_KEY`）三處改成新值；`pnpm test`（48 tests 全過）、`pnpm typecheck`（無錯誤）後 commit
    4. RevenueCat 建立新「SPARK SCALE (App Store)」App，綁定新 bundle ID，沿用帳號共用的 In-App Purchase Key（`XLCX2BBUZB`），取得新 Public API Key
    5. 使用者於自己的 Terminal.app 互動執行 `eas build --platform ios --profile production`（非互動模式對全新 bundle ID 的憑證設定會失敗）成功產出 .ipa，再互動執行 `eas submit` 成功上傳到新 App 記錄的 TestFlight
    6. 逐項從舊 App 記錄搬遷 App Store Connect metadata 到新記錄：主要類別（發現 select 下拉選單視覺上像有選取但 `.value` 實際是空字串，須用 JS 直接設定並 dispatch change 事件）、中英文 Store 描述（順手修正英文描述殘留的舊「SPARK FIT」品牌字樣）、4 張 App Store 截圖（用 curl 直接抓舊 App 頁面上公開的 mzstatic.com CDN 原始解析度圖檔）、隱私權政策 URL（發現此欄位逐 locale 獨立設定，英文 locale 原本是空的——同一套「只修中文漏修英文」通病再次出現）、年齡分級、訂閱群組「SPARK SCALE Pro」自己的本地化顯示名稱（跟個別方案本地化是分開的欄位）、Pro 月費／年費兩個訂閱項目含跨 175 個國家/地區的定價
    7. App Store Connect：把 iOS App 1.0.0(3)＋訂閱群組＋Pro 月費＋Pro 年費四個項目透過各自的「新增以供審查」→「iOS 提交項目草稿」合併成同一份草稿，確認「已可提交的項目 (4)」無誤後點擊「提交以供審查」，顯示「已提交 4 個項目」
- 執行過的驗證：`pnpm test`（48 tests 全過）；`pnpm typecheck`（無錯誤）；`eas build`/`eas submit` 皆由使用者實際互動執行且成功；App Store Connect 頁面確認 App 版本狀態為「正在等待審查」
- 已擷取證據：見 feature_list.json appstore-001 evidence（本輪新增，含完整遷移步驟）
- 提交記錄：換用新 bundle ID `com.sparkscale.app` 解決 Apple 4.1(c) SparkFit 撞名拒絕（詳見本輪 commit）
- 已知風險或未解決問題：Apple 這輪審查結果尚未知；「只修中文 locale 漏修英文 locale」在本帳號已反覆出現至少 3 次（本次 EULA、隱私權政策 URL 皆是），是系統性漏洞模式，之後任何 locale 相關欄位修改都要逐一檢查每個已發佈語系
- 下一步最佳動作：等 Apple 審查結果；若被拒，讀新的拒絕訊息內容再處理
- 補充（同日稍後）：使用者詢問舊記錄「保留但停用」的確切狀態，查證發現舊記錄其實還有一筆診斷回合送出、尚未撤回的「等待審查」提交（bundle ID 從未修正，幾乎必然會再次被 4.1(a) 拒絕）。經使用者確認後，於 App Store Connect 舊記錄的 iOS App 版本頁面點擊「將此版本從審查中移除」並確認，狀態變成「被開發者拒絕」，三筆歷史提交全部顯示「已移除」，舊記錄自此完全閒置、不會再被 Apple 審查。App Store Connect 不提供刪除已有審查紀錄之 App 記錄的功能，故舊記錄長期保留但不再使用即可，無需進一步處置。

### 工作階段 024

- 日期：2026-08-21
- 本輪目標：查看 8/21 新一輪 App 審查拒絕原因並逐一修復後重新送審
- 已完成：
  - 讀取這輪拒絕訊息，確認為 3 條：2.3.7（名稱/副標題含不相關內容）、3.1.2(c)（訂閱畫面缺 EULA 連結）、4.1.0 Copycat（App 名稱含「SparkFit」與第三方撞名）
  - 3.1.2(c)：確認 App 描述已有 EULA 連結（`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`），實際打開 App 內「隱私權政策」「服務條款」連結驗證都能正常開啟；使用者提供新錄的 `video 2.mp4`（44秒，有實際點開兩個連結證明可用），Claude 逐幀檢查內容合格後直接附加回覆 App 審查訊息
  - 4.1/2.3.7：比對其他 4 個 SPARK 系列 App 的審查狀態（SPARK WEAR／SPARK SHAPE 已上架、SPARK LOG 另一原因被拒），確認只有「SPARK FIT」這個名稱組合撞名，其他 App 不受影響；使用者決定改名為「SPARK SCALE」
  - 改名執行範圍：`app.json`（name + 3 處相機/相簿權限說明文字）、iOS `Info.plist`（CFBundleDisplayName + 權限文字）、Android `strings.xml`/`settings.gradle`、App 內 4 處 UI 標題文字（首頁/資料頁/報告頁/分析頁）、訂閱方案顯示文字（`app/settings.tsx`）、匯出備份提示訊息（`src/hooks/useBackup.ts`）；明確不動 `bundleIdentifier`/`package`（`com.sparkfit.app`，牽動 App Store Connect 綁定與 IAP，不能改）與 SQLite DB 檔名（純內部識別碼）
  - 圖示：使用者提供新設計（體重計圖案），去背後依原圖示比例（圓形佔畫布約90%）重新輸出 `icon.png`（1024×1024 RGB 無透明度）與 `adaptive-icon.png`（747×747 RGBA 真透明），跑 `npx expo prebuild` 同步到 iOS/Android 原生專案，實際打開檔案確認圖示內容正確
  - App Store Connect 同步更新：App 名稱→「SPARK SCALE心動體重」、描述內文（「SPARK FIT 誕生了」→「SPARK SCALE」）、App 審查資訊備註（2 處英文提及）、訂閱群組顯示名稱（「SPARK FIT Pro」→「SPARK SCALE Pro」）；副標題後續改為「記錄體重身形，圖表追蹤趨勢」（原本「數據化管理體態，穿搭避坑不踩雷」用語偏口語行銷，怕觸發 2.3.7）
  - 重新拍攝 4 張 App Store 截圖（iPhone 13 Pro Max 模擬器，1284×2778 符合 6.5 吋規格）：build 新版 App、用 cliclick + AppleScript 操作模擬器點擊/滑動、期間發現測試廣告會蓋住畫面，暫時把 `useIsPro.ts` 改成強制回傳 true 拍完立刻改回並用 `git diff` 確認完全還原乾淨；4 張截圖轉 RGB 去除 alpha 後用 `file_upload` 工具上傳、存檔
  - 確認 App Store Connect 其他欄位（版權、支援/行銷 URL、關鍵字、自訂產品頁面）都乾淨、不需更動；發現外部支援網站 `kyomistudio.github.io/support.html` 仍列著「SPARK FIT」，但該網站不在本 repo，留給使用者另外處理
  - `git commit`（`03469d8`）只包含改名相關的 9 個檔案，兩支審查證明影片刻意不入庫（非 App 資產）
  - 副標題存檔後點擊「重新提交至 App 審查」，狀態變成「等待審查」
- 執行過的驗證：`npm run typecheck` 通過；`npm test` 48 個測試全數通過（含改動前後各跑一次確認 `useIsPro.ts` 暫時改動有完整還原）；`git status`/`git diff` 逐一核對改動範圍精確無誤；4 張截圖用 Python PIL 確認尺寸 1284×2778、RGB 無 alpha；App Store Connect 畫面截圖逐項核對名稱/副標題/描述/截圖/訂閱群組顯示名稱皆已更新
- 已擷取證據：見 feature_list.json appstore-001 evidence（本輪新增）
- 提交記錄：`03469d8` fix: App 改名為 SPARK SCALE，修復 4.1 Copycat 撞名與 2.3.7 metadata 審查問題
- 已知風險或未解決問題：Apple 這輪審查結果尚未知；外部支援網站文案未同步改名（不在本 repo 範圍）
- 下一步最佳動作：等 Apple 審查結果；若再被拒，讀新的拒絕訊息內容再處理

### 工作階段 023

- 日期：2026-08-19
- 本輪目標：使用者把手機螢幕錄影放進 `assets/images/`，請 Claude 檢查能不能用來回覆 Apple 的 Guideline 2.1 Information Needed 要求，可以的話上傳並重新送審（同一天已在 SPARKSHAPE／SPARKPLATE 做過同樣流程，這次直接套用學到的做法）
- 已完成：
  - 用 ffmpeg 擷取 `ScreenRecording_08-19-2026 13-07-55_1.mp4`（70秒）關鍵影格檢視內容：從主畫面點圖示啟動 App → 設定頁 PRO 訂閱卡片 → 點「訂閱」（處理中→跳出 TestFlight 沙盒購買確認彈窗，方案/價格/帳號/「僅供測試使用」皆可見）→ 瀏覽核心功能（身體組成數據、目標體重、實際點「+」開啟「新增數據」空白表單、報告頁日期區間折線圖）→ 從鎖定的「分析」頁再次觸發升級提示 → 第二次購買嘗試跳出要求輸入 Apple ID 密碼的 TestFlight 確認框（密碼欄位全程維持空白未輸入任何字元）→ 兩次購買皆顯示「升級失敗 Purchase was cancelled」安全取消；內容完整度高，一次到位不需重錄
  - 原始檔案 91.4MB，超過瀏覽器上傳工具 10MB 限制，用 ffmpeg 壓縮（scale=750, crf 24, aac 96k）到 3.9MB，抽查畫面文字仍清楚可辨識
  - 去 App Store Connect 確認這輪拒絕訊息內容（維持原本 7 點，跟 SPARKPLATE 一樣沒有 SPARKSHAPE 那輪額外出現的第 8 點），撰寫英文備註文字（涵蓋裝置清單 iPhone 17/iOS 26、App 功能與目標受眾、設定/存取說明、IAP 可購買項目與導覽方式、外部服務清單 RevenueCat/AdMob、地區差異、受監管產業聲明）
  - App Store Connect：套用同日學到的正確順序——先點『更新審查內容』讓狀態從『已拒絕』轉成『準備審查』（此時備註會被清空但附件不會），重新填備註／上傳附件／存檔／重新整理頁面用 JavaScript 讀取 textarea.value 確認真的有持久化，最後點『重新提交至 App 審查』，狀態變成『等待審查』
- 執行過的驗證：ffmpeg 擷取關鍵影格逐張檢視影片內容（含放大檢查密碼欄位全程空白，確認未輸入敏感資訊）；用瀏覽器 JavaScript 直接讀取 textarea.value 確認備註文字（2,953 字）在存檔＋重新整理後正確持久化；App Store Connect 頁面確認提交項目狀態變成『等待審查』
- 已擷取證據：見 feature_list.json appstore-001 evidence（本輪新增）
- 提交記錄：無程式碼變更，本輪未產生 git commit（純 App Store Connect 後台操作＋本機影片壓縮）
- 已知風險或未解決問題：Apple 這輪審查結果尚未知
- 下一步最佳動作：等 Apple 審查結果；若再被拒，讀新的拒絕訊息內容再處理

### 工作階段 022

- 日期：2026-08-13
- 本輪目標：使用者要求把 App Store Connect 的繁體中文 App 名稱改為「SPARK FIT心動身形」，改完送出審核
- 已完成：App Store Connect → App 資訊 → 繁體中文（主要語言）「名稱」欄位改為「SPARK FIT心動身形」並存檔；App 當時狀態為「正在等待審查」，確認純文案修改不需要額外送出動作（僅提交新 build 才需要先撤回審查）
- 執行過的驗證：儲存後畫面顯示「已儲存」；App 列表頁確認名稱已變更、審查狀態仍是「正在等待審查」
- 提交記錄：無程式碼變更，本輪未產生 git commit（純 App Store Connect 後台操作）
- 已知風險或未解決問題：無
- 下一步最佳動作：等 Apple 審查結果

### 工作階段 021

- 日期：2026-08-10
- 本輪目標：使用者請 Claude 檢查 SPARKPLATE/SPARKFIT/SPARKLOG 是否有跟 SPARKSHAPE 一樣的 App Store 審查缺口（訂閱付費畫面缺必要資訊），確認有之後主動修復並重新送審
- 已完成：
  - 確認本專案（當時在 App Store 審查佇列中，從未被拒絕過）的 `src/services/purchases.ts`／`src/constants/monetization.ts` 跟 SPARKSHAPE 修復前的版本結構完全相同，`app/settings.tsx` 的 PRO 解鎖卡片也只有一顆泛用「升級 Pro」按鈕，沒有 Apple Guideline 3.1.2(c) 要求的訂閱標題/期間/價格/服務條款/隱私權政策連結
  - 使用者確認後，先在 App Store Connect 把當時等待審查中的提交項目撤回（避免舊 build 卡住）
  - 套用 SPARKSHAPE/SPARKWEAR 同一組修法：新增 `PRIVACY_POLICY_URL`/`TERMS_OF_USE_URL`、新增 `fetchPackages`/`purchasePackage`、`app/settings.tsx` 的 PRO 卡片改成逐一列出 RevenueCat 真實方案（標題含「SPARK FIT」、期間、價格）＋可點擊的隱私權政策/服務條款連結
  - `eas build --platform ios --profile production` 成功（Build 3→4，過程中一度誤以為 build log 顯示了錯誤的專案名稱/bundle id，重新用 `eas build:list` 與下載的 .ipa `Info.plist` 直接核對確認實際建置目標正確無誤才是顯示層面的暫時性錯覺）→ `eas submit --platform ios --profile production --latest` 成功上傳
  - App Store Connect：等 Apple 處理完 Build 4 後換上新 build、確認無「受監管醫療器材聲明」阻擋項目、點「新增以供審查」重新送審
- 執行過的驗證：`npx jest` 全過（48 tests，含新增的 fetchPackages/purchasePackage 測試）；`npx tsc --noEmit -p .` 零錯誤；`eas build`/`eas submit` 皆實際執行且成功；App Store Connect 確認重新送審後狀態為「正在等待審查」
- 已擷取證據：見 feature_list.json appstore-001 evidence
- 提交記錄：681f5ac（訂閱付費畫面修復）
- 已知風險或未解決問題：Apple 這輪審查結果尚未知；本項是 proactive 修復（這個 App 本身未曾因這個理由被拒），最終是否通過需等 Apple 實際審查
- 下一步最佳動作：等 Apple 審查結果（通常會寄信通知或在 App Store Connect 顯示）；若被拒，讀新的拒絕訊息內容再處理

### 工作階段 020

- 日期：2026-08-08
- 本輪目標：使用者回報「SPARK FIT 屢次停止動作」，修好 Android 版閃退
- 已完成：
  - 用 `adb shell dumpsys dropbox --print` 抓到崩潰堆疊：`MobileAdsInitProvider` 啟動時丟出 `IllegalStateException: Invalid application ID`，是 App 一啟動就 100% 必崩，符合「屢次停止動作」的症狀
  - 根因：`android/` 是 gitignored、由 `expo prebuild` 產生的本地檔案，最後一次生成是 6/29，早於後續加上的 AdMob config plugin 設定；build-apk skill 的腳本邏輯是「`android/` 已存在就不重跑 prebuild」，導致 AdMob 的 `com.google.android.gms.ads.APPLICATION_ID` meta-data 從未真的寫進 manifest
  - 執行 `rm -rf android && npx expo prebuild --platform android` 重新生成後，又連續踩到兩個同樣屬於「`android/` 長期未跟 `app.json` 同步」的既有問題，逐一修掉：
    1. `AndroidManifest.xml` 缺 `windowSoftInputMode` 對應的 drawable：`app.json` 的 `splash` 缺少 `image`（比對 SPARKWEAR/SPARKSHAPE/SPARKPLATE 三個姊妹專案都有設 `image`+`resizeMode`），導致 SDK 54 的 splash 外掛寫了 style 參照但沒真的產生 `splashscreen_logo` drawable。補上 `"image": "./assets/images/splash-icon.png"`、`"resizeMode": "contain"`（素材本來就在 `assets/images/splash-icon.png`，只是沒被引用）
    2. `app.json` 的 `android.softwareKeyboardLayoutMode` 原值是 `"nothing"`，但 Expo 該欄位型別只接受 `'resize' | 'pan'`，不合法值會被原樣寫進 manifest 造成 AAPT 連結失敗（`'nothing' is incompatible with attribute windowSoftInputMode`）。改成 `"resize"`（Expo 預設值）
  - 三個問題都修完後 `./gradlew assembleRelease` 建置成功，`adb install -r` 裝到實機（Pixel 10, `58081FDCR0048L`）並 `adb shell am start` 啟動，確認 process 存活、`adb logcat -d -b crash` 無新崩潰紀錄
  - 新 APK 已複製到 Google Drive：`SPARK-Builds/SPARKFIT/sparkfit-v1.0.0-20260808-1602.apk`
- 執行過的驗證：`npx tsc --noEmit`（無錯誤）；`npx jest`（6 suites、42 tests 全過）；實機安裝＋啟動＋`adb logcat` 確認無崩潰
- 已知風險或未解決問題：`android/` 這個生成流程本身仍是隱患來源——只要之後 `app.json` 再改、又剛好走到「`android/` 已存在故跳過 prebuild」的路徑，同類問題可能再發生；目前是靠這輪手動 `rm -rf android` 全新生成才連帶修掉，沒有機制自動偵測 config 與生成的 native 專案是否同步
- 下一步最佳動作：build-apk skill 腳本可以考慮改成每次都先 `rm -rf android` 再 prebuild（犧牲一點建置時間換取正確性），或至少在 app.json 有修改時提醒需要重新 prebuild；下次工作階段開始時照常從 feature_list.json 選下一個 not_started 功能

### 工作階段 019

- 日期：2026-08-01
- 本輪目標：RevenueCat 官方事故排除後重測，修好順便發現的真實 bug
- 已完成：
  - 實機重測「升級 Pro」確認購買流程成功（RevenueCat 事故已解決）
  - 修正 `useProGate.ts`：「升級 Pro」按鈕從 `router.push('/settings')` 改成直接呼叫 `purchasePro()` 觸發真實購買（跟 SPARKWEAR/SPARKPLATE 同一輪修正，原因是使用者觸發時通常已經身處設定頁，導頁沒有可見效果）
  - 更新 `src/__tests__/hooks/useProGate.test.ts` 對應新行為
- 執行過的驗證：`npx tsc --noEmit`（無新增錯誤）；`npx jest`（6 suites、42 tests 全過）；實機互動測試確認修好
- 已知風險或未解決問題：無
- 下一步最佳動作：無（monetization-001 全部完成）

### 工作階段 018

- 日期：2026-07-27
- 本輪目標：實機建置驗證 AdMob／RevenueCat
- 已完成：`npx expo run:ios --device` 成功建置並安裝到實機，App 正常開啟
- 執行過的驗證：實機互動測試——點「升級 Pro」出現 `升級失敗：None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect`，排查 Bundle ID／App Store Connect 商品狀態／RevenueCat 設定皆正確，判定是 RevenueCat 官方已知事故造成（同一輪其他 3 個非 SPARKWEAR 的 App 也是同樣錯誤）
- 已知風險或未解決問題：購買流程尚未驗證成功
- 下一步最佳動作：等 RevenueCat 網站上方事故提示消失後，直接開已裝好的 App 重測「升級 Pro」，不用重新 build

### 工作階段 017

- 日期：2026-07-27
- 本輪目標：設定 RevenueCat（照 SPARKWEAR 範本流程複製）
- 已完成：建立 RevenueCat App（Bundle ID `com.sparkfit.app`，用 5 個 App 共用的 In-App Purchase Key P8）→ 拿到 Public API Key `appl_fvCFOIjBVapijlCwfWBVVWUYtty`；建立 `pro` entitlement 並接上 `com.sparkfit.app.pro.monthly`／`.pro.yearly`；`default` offering 的 Monthly/Yearly package 接上對應商品；`src/constants/monetization.ts` 的 `REVENUECAT_API_KEY` 換成正式 Key
- 執行過的驗證：`npx tsc --noEmit`（無新增錯誤）；`npx jest`（6 suites、41 tests 全過）
- 已知風險或未解決問題：尚未實機測試真實購買流程
- 下一步最佳動作：等 5 個 App 都做完後，找時間跑一次原生 build，實機測試購買/恢復購買流程

### 工作階段 016

- 日期：2026-07-23
- 本輪目標：使用者在 AdMob 後台建好橫幅廣告單元，把測試版位換成正式的
- 已完成：`src/constants/monetization.ts` 的 `BANNER_AD_UNIT_ID` 改成 `Platform.select`，iOS 用正式 ID `ca-app-pub-8914492142878610/9526072587`，Android 維持 `TestIds.BANNER`
- 執行過的驗證：`npx tsc --noEmit`（無新增錯誤）；`npx jest`（6 suites、41 tests 全過）
- 已知風險或未解決問題：需要重新原生 build 才會真正生效；AdMob 應用程式狀態目前是「需審核」
- 下一步最佳動作：找時間跑一次原生 build 讓新 ID 生效；之後設定 RevenueCat

### 工作階段 015

- 日期：2026-07-23
- 本輪目標：使用者申請好真實 AdMob 帳號，把 iOS App ID 換成正式的
- 已完成：`app.json` config plugin 的 `iosAppId` 換成 `ca-app-pub-8914492142878610~7474624319`；`androidAppId` 維持 Google 官方測試 ID（Android 一律視為 Pro，`AdBanner` 永遠不會渲染，不需要申請真的 Android 廣告版位）
- 執行過的驗證：`python3 -c "json.load(...)"` 確認 app.json 仍是合法 JSON
- 已知風險或未解決問題：這個改動屬於原生設定（會寫入 iOS Info.plist 的 GADApplicationIdentifier），純 JS 的 `eas update` OTA 推不動，需要重新 `expo prebuild`/整套 build 才會生效；廣告單元 ID（`BANNER_AD_UNIT_ID`）還沒換，目前仍是 Google 測試版位，待使用者在 AdMob 後台建立橫幅版位後提供
- 下一步最佳動作：收到廣告單元 ID 後更新 `src/constants/monetization.ts`；之後找時間跑一次原生 build 讓新 App ID 生效

### 工作階段 014

- 日期：2026-07-23
- 本輪目標：分頁列底部安全區改成依「有沒有廣告」動態決定（跟 SPARKWEAR/SPARKPLATE/SPARKSHAPE 同步處理）
- 已完成：
  - `app/(tabs)/_layout.tsx` 加 `useSafeAreaInsets()` + `useIsPro()`，`bottomInset = isPro ? insets.bottom : 0`，動態加到 `tabBarStyle.height`/`paddingBottom`
  - 順手修掉 3 個分頁畫面（index/analysis/report）原本 `<SafeAreaView style={styles.container}>` 沒有指定 `edges`（預設四邊都留），導致不管有沒有廣告都無條件多留一份底部安全區、跟分頁列白色背景融成一塊（跟 SPARKSHAPE 上一輪修的分頁列過高是同一類 bug，這裡背景都是白色所以更不明顯）；改成 `edges={['top','left','right']}`，安全區統一交給分頁列這個唯一入口處理
- 執行過的驗證：`npx tsc --noEmit`（無錯誤）；`npx jest`（6 suites、41 tests 全過）
- 已知風險或未解決問題：Pro（無廣告）分支目前無法在模擬器上實測（RevenueCat 尚未設定金鑰），邏輯依賴標準 `useSafeAreaInsets()` 疊加，未做額外模擬器驗證
- 下一步最佳動作：下次工作階段開始時照常從 feature_list.json 選下一個 not_started 功能

### 工作階段 013

- 日期：2026-07-23
- 本輪目標：移除首頁跳轉 SPARK SHAPE/SPARK PLATE 的互連連結（使用者要求跟 SPARKSHAPE/SPARKPLATE 同步處理）
- 已完成：`app/index.tsx` 移除 `openApp()`、`APP_DOWNLOAD_URLS`、`appsRow` 連結區塊與相關 style、未用到的 `Alert`/`Linking` import
- 執行過的驗證：`npx tsc --noEmit`（無錯誤）；`npx jest`（6 suites、41 tests 全過）
- 已知風險或未解決問題：無（`assets/images/favicon.jpeg` 為既有未追蹤檔案，非本次改動，維持不加入版控）
- 下一步最佳動作：下次工作階段開始時照常從 feature_list.json 選下一個 not_started 功能

### 工作階段 012

- 日期：2026-07-23
- 本輪目標：複製 SPARKWEAR/SPARKPLATE/SPARKSHAPE 的付費功能範本到 SPARKFIT（monetization-001）
- 已完成：
  - 安裝 `react-native-google-mobile-ads`（鎖定 16.3.4）與 `react-native-purchases`
  - 新增 `src/constants/monetization.ts`、`src/services/purchases.ts`、`src/hooks/useIsPro.ts`、`src/hooks/useProGate.ts`、`src/components/AdBanner.tsx`
  - `settingsStore.ts`（zustand persist middleware）加 `isProUnlocked`/`setProUnlocked`
  - 這個 App 有獨立的 `app/settings.tsx` 路由（不是 Modal），升級提示直接 `router.push('/settings')`，接上主題色/匯出/匯入的 `requirePro` 鎖，加 PRO 解鎖區塊（升級 Pro／恢復購買）
  - `app/(tabs)/analysis.tsx`（分析頁）用「所有 hooks 呼叫完之後、其餘邏輯之前 return 鎖定畫面」的寫法達成「分頁仍顯示但點進去是升級提示」
  - 廣告放置：首頁、三個分頁（掛在 `app/(tabs)/_layout.tsx` 共用一條，分頁列原本手動加的 `paddingBottom:24` 改成 `paddingBottom:6`）
  - 這個專案的 `settingsStore.test.ts` 原本就有 inline `jest.mock('@react-native-async-storage/async-storage', ...)`，新測試檔跟著加一樣的 mock 才能過
  - 新增對應單元測試，41 tests 全過；`npx tsc --noEmit -p .` 完全無錯誤
  - `npx expo prebuild --platform ios && pod install` 成功；`npx expo run:ios` 建置成功並在模擬器實測：首頁看得到 AdMob 測試廣告（誤觸後正確開啟 Safari 到 AdMob 官網，證實廣告是真的有載入渲染的可點擊單元，不是空殼）
- 執行過的驗證：`./init.sh`（41 tests passed）、`npx tsc --noEmit -p .`（無錯誤）、模擬器手動操作（僅確認首頁與廣告；進入設定頁測試個別鎖點時因為廣告版位尺寸關係一直點不準座標，沒能完成）
- 已擷取證據：見 feature_list.json monetization-001 evidence
- 提交記錄：（見本輪 commit）
- 已知風險或未解決問題：個別鎖點（主題色/匯出/匯入的升級提示、分析頁鎖定畫面、恢復購買、Android 全功能開放、三個分頁的廣告位置）都還沒實際點過確認，只有單元測試佐證（測的是同一個 requirePro 函式，跟其他三個 App 已經人工驗證過的邏輯完全相同）
- 下一步最佳動作：使用者有空時自己測一輪 → monetization-001 改 passing；接著複製到 SPARKLOG（5 個 App 的最後一個）

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
