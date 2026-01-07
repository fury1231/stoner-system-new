# AI Prompt 模板

## 🚀 快速開始（最常用）

```
專案：多分店收款管理系統
路徑：/home/mstpri/stoner-system
版本：v3.6
狀態：生產就緒

請先讀取：
- CLAUDE.md（專案指南）
- STATE.md（當前狀態）

技術棧：Vue 3 + Express + SQLite/PostgreSQL

關鍵規則：
1. 修改後更新 AdminDashboard.vue L9 版本號
2. 完成任務後更新 STATE.md
3. 部署：./update-frontend.sh（前端）｜ ./deploy.sh（完整）

開始工作！
```

---

## 📋 任務類型模板

### 🐛 修 Bug
```
Bug：[描述問題]
位置：[檔案路徑]
預期行為：[應該怎樣]
實際行為：[實際怎樣]

修好後更新 STATE.md
```

### ✨ 新功能
```
功能：[功能名稱]

需求：
- [需求 1]
- [需求 2]
- [需求 3]

完成後：
- 版本號 +1（改 AdminDashboard.vue L9）
- 更新 STATE.md
- 測試所有相關功能
```

### 🚀 部署到 VPS
```
部署當前版本（v3.6）到 VPS

步驟：
1. SSH 到 VPS
2. cd /var/www/stoner-system
3. git pull
4. ./deploy.sh

回報結果
```

### 🔍 Code Review
```
審查 v3.X 的修改

檢查項目：
- 代碼品質
- 安全性
- 效能
- 驗證規則（create & update 都要檢查）

提供簡潔的反饋
```

### 🔧 修改驗證規則
```
修改 [某欄位] 的驗證規則

位置：backend/src/middleware/validation.ts

新規則：
- [規則 1]
- [規則 2]

記得：
- 前端也要改（PaymentForm.vue）
- create 和 update 都要改
- 測試邊界情況
```

---

## 🔍 查詢類模板

### 找檔案
```
搜尋包含 [關鍵字] 的所有檔案
範圍：[frontend/backend/全部]
```

### 理解流程
```
解釋 [功能] 是怎麼運作的

包含：
- API 流程
- 驗證邏輯
- UI 互動

保持簡潔
```

### 查資料庫
```
顯示 [資料表名稱] 的結構

包含：欄位、索引、關聯
```

---

## 🛠 維護類模板

### 更新套件
```
檢查並更新過期的 npm 套件
更新後測試
回報任何 breaking changes
```

### 安全性審查
```
執行安全性審查

檢查：
- 身份驗證
- 權限控制
- 輸入驗證
- SQL 注入風險

提供可執行的建議
```

### 效能分析
```
分析 [功能/頁面] 的效能

建議優化方向
重點：資料庫查詢、前端渲染、API 響應時間
```

---

## 💡 進階技巧

### 1. 限制回應長度
```
[任務描述]

限制：回應控制在 50 行以內，只給關鍵資訊
```

### 2. 只要代碼
```
[任務描述]

只給代碼，不要解釋
```

### 3. 分步驟執行
```
[大任務]

先做步驟 1，完成後等我確認再做步驟 2
```

### 4. 多檔案修改
```
同時修改：
1. backend/src/middleware/validation.ts
2. frontend/src/components/PaymentForm.vue
3. frontend/src/pages/AdminDashboard.vue

確保三個檔案的邏輯一致
```

---

## 📝 完整範例

### 範例 1：新增驗證規則
```
我要新增金額上限驗證

請先讀取 CLAUDE.md 和 STATE.md

需求：
1. 金額必須在 0 到 1,000,000 之間
2. 錯誤訊息要用中文
3. create 和 update 都要加
4. 前端也要加限制

完成後：
- 版本號改成 v3.7（AdminDashboard.vue L9）
- 更新 STATE.md
- 給我部署指令

保持簡潔
```

### 範例 2：修 Bug
```
Bug：會員管理的權限顯示不正確

位置：frontend/src/pages/AdminDashboard.vue
問題：權限顯示英文，應該要中文

請修復並測試
```

### 範例 3：部署
```
專案：/home/mstpri/stoner-system
版本：v3.6

現在要部署到 VPS

給我完整的部署指令和檢查清單
```

---

## 🎯 最佳實踐

### ✅ 好的 Prompt
```
專案：/home/mstpri/stoner-system（v3.6）
讀取：CLAUDE.md, STATE.md

任務：允許金額為 0

修改位置：
- backend/src/middleware/validation.ts
- frontend/src/components/PaymentForm.vue

完成後更新 STATE.md
```

### ❌ 不好的 Prompt
```
幫我改一下金額那邊
```

---

## 🔑 關鍵 Prompt 組件

每個 prompt 最好包含：

1. **專案路徑**：`/home/mstpri/stoner-system`
2. **版本**：`v3.6`
3. **上下文**：`讀取 CLAUDE.md, STATE.md`
4. **具體任務**：清楚描述要做什麼
5. **完成後動作**：更新版本、更新 STATE.md

---

**最後更新**：2025-10-19
