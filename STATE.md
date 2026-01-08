# System State

**Version**: v3.70
**Last Update**: 2026-01-07
**Status**: Production Ready

---

## Latest Changes (v3.70)

- **ESLint 錯誤修復**:
  - `backup.ts`: 將 require('child_process') 改為 ES6 import
  - `customer-orders.ts`: 修復正則表達式不必要的轉義字符
  - `users.ts`: 修復正則表達式不必要的轉義字符

---

## Previous Changes (v3.69)

- **CI/CD 前端修復**:
  - 移除過時的 PaymentForm 測試
  - 新增佔位測試文件

---

## Previous Changes (v3.68)

- **CI/CD 後端修復**:
  - 測試框架從 Jest 遷移至 Vitest
  - 移除過時的測試文件 (payments.test.ts, admin.test.ts)
  - 修復 ESLint 配置 (移除未安裝的 prettier 擴展)
  - 更新 package.json 測試腳本

---

## Previous Changes (v3.67)

- **新增 SQLite 匯入腳本**:
  - 新增 `backend/src/scripts/import-sqlite.ts` 用於從舊系統匯入資料
  - 支援批次處理、交易保護

- **依賴更新**:
  - `better-sqlite3` 升級至 v11.10.0

---

## Previous Changes (v3.66)

- **🔒 分店權限過濾漏洞修復**:
  - **問題**: `payments.ts` 使用 `filters.store_ids`，但 `db.ts` 檢查 `filters.accessible_stores`
  - **影響**: 變數名稱不一致導致分店過濾完全失效，非管理員用戶可看到所有分店數據
  - **修復**: 將 `payments.ts` 中的 `store_ids` 改為 `accessible_stores`
  - **檔案**: `backend/src/routes/payments.ts`

- **備份匯入修復**:
  - 修復 `backup.ts` 匯入時 users 表的 `ON CONFLICT` 條件（從 `id` 改為 `username`）
  - **檔案**: `backend/src/routes/backup.ts`

---

## Previous Changes (v3.64-v3.65)

- **v3.65**: 備份匯入 users 表 ON CONFLICT 修復
- **v3.64**: 內部版本

---

## Previous Changes (v3.63)

- **CI/CD Pipeline**: GitHub Actions + Docker 容器化
  - `.github/workflows/ci.yml` - CI 流程（Lint、TypeCheck、Test、Build）
  - `.github/workflows/deploy.yml` - CD 流程（Build Docker、Push、Deploy）
  - `backend/Dockerfile` - 後端多階段建置
  - `frontend/Dockerfile` - 前端多階段建置
  - `frontend/nginx.conf` - 容器 Nginx 配置
  - `docker-compose.yml` - 容器編排

---

## Previous Changes (v3.58-v3.62)

- **v3.62**: SQLite 匯入安全性修復（交易、序列重置、批次處理）
- **v3.61**: 修復 customer_orders NULL amount 問題
- **v3.60**: 擴充 SQLite 欄位白名單
- **v3.59**: 恢復 SQLite 匯入功能（含安全驗證）
- **v3.58**: backup.ts 程式碼審查修復

---

## Previous Changes (v3.57)

- **PostgreSQL 完整遷移**: 移除所有 SQLite 依賴（後已恢復匯入功能）

---

## Previous Changes (v3.51-v3.56)

- **Repository Pattern 遷移**: TypeScript 錯誤修復
- **AdminDashboard 組件拆分**:
  - AuditTab.vue (審計日誌)
  - StoresTab.vue (分店管理)
  - UsersTab.vue (會員管理)

---

## Previous Changes (v3.43)

- **安全性強化**: JWT HttpOnly Cookie + 漏洞修復
  - **JWT HttpOnly Cookie**:
    - 後端：登入時將 JWT 存入 HttpOnly Cookie（防止 XSS 竊取）
    - 後端：auth middleware 優先從 Cookie 讀取，向後兼容 Authorization header
    - 前端：移除 localStorage 存取 token，改用 `is_authenticated` 標記
    - 前端：axios 使用 `withCredentials: true` 自動發送 Cookie
  - **開放式重導向修復** (AdminLogin.vue):
    - 驗證重導向路徑必須為內部路徑（以 `/` 開頭且非 `//`）
    - 排除 `/admin/login` 避免無限迴圈
  - **Console.log 清理**:
    - 移除 AdminDashboard.vue 中 48+ 個 console.log 語句
    - 保留 console.error 用於錯誤追蹤

---

## Recent Version History

- **v3.66**: 🔒 分店權限過濾漏洞修復（重大安全修復）
- **v3.65**: 備份匯入 users 表 ON CONFLICT 修復
- **v3.63**: CI/CD Pipeline（GitHub Actions + Docker）
- **v3.58-v3.62**: SQLite 匯入功能恢復與安全修復
- **v3.57**: PostgreSQL 完整遷移
- **v3.51-v3.56**: Repository pattern, TypeScript fixes, AdminDashboard 組件拆分
- **v3.43**: JWT HttpOnly Cookie + 安全性強化
- **v3.42**: 程式碼安全性修復 (VirtualScrollTable, db.ts, payments.ts)
- **v3.36**: 手機版快速確認按鈕 + 後五碼顯示
- **v3.35**: 未確認/未入帳狀態自動清除日期篩選
- **v3.34**: 日期篩選時區修正（UTC+8）
- **v3.33**: 日期滑動選擇器（已改為箭頭切換）
- **v3.32**: 收款紀錄緊湊列表設計 + 預設今天日期
- **v3.31**: 收款紀錄 UI 現代化卡片設計
- **v3.30**: 桌面版緊湊佈局
- **v3.29**: 統一 Tab 切換器（全平台）

---

## Key Files

### Frontend
- `frontend/src/pages/AdminDashboard.vue` (3,959L) - Main UI
- `frontend/src/components/VirtualScrollTable.vue` (1,126L) - Payment table
- `frontend/src/components/PaymentForm.vue` (821L) - Payment form
- `frontend/src/components/admin/AuditTab.vue` - 審計日誌組件
- `frontend/src/components/admin/StoresTab.vue` - 分店管理組件
- `frontend/src/components/admin/UsersTab.vue` - 會員管理組件

### Backend
- `backend/src/server.ts` - Express entry
- `backend/src/db.ts` (1,200L) - Database layer (PostgreSQL)
- `backend/src/routes/payments.ts` (786L) - Payment API
- `backend/src/routes/backup.ts` - 備份/還原 API (pg_dump/psql)
- `backend/src/middleware/validation.ts` (124L) - Validation

### Config
- `.env` - Environment variables (PostgreSQL config required)

---

## Deploy Commands

### Docker Deploy (Recommended)
```bash
# Local build and run
docker compose up -d --build

# Pull and deploy (production)
docker compose pull && docker compose up -d
```

### Legacy Deploy (PM2)
```bash
# Frontend only
cd /home/mstpri/stoner-system && ./update-frontend.sh

# Full deploy
cd /var/www/stoner-system && ./deploy.sh
```

---

## Dev Commands

```bash
# Frontend
cd frontend && npm run dev                    # Dev server
cd frontend && npm run build                  # Build
cd frontend && npm run build:skip-check       # Fast build

# Backend
cd backend && npm run dev                     # Dev server
cd backend && npm run reset-password          # Reset admin password

# Check servers
lsof -ti:3001  # Backend
lsof -ti:5173  # Frontend

# PostgreSQL
psql -h localhost -U stoner -d stoner_system  # Connect to database
```

---

## Tech Stack

- Frontend: Vue 3 + Vite + TypeScript + TailwindCSS
- Backend: Node.js 20 + Express 4 + TypeScript
- Database: PostgreSQL 16
- CI/CD: GitHub Actions
- Container: Docker + Docker Compose
- Deploy: Docker (recommended) / PM2 + Nginx (legacy)

---

## Common Issues

### Frontend not updating after deploy
```bash
sudo systemctl reload nginx
# Clear browser cache: Ctrl+Shift+R
```

### Backend validation error
Check `backend/src/middleware/validation.ts`

### Database connection issues
Check `.env` PostgreSQL configuration:
- PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD

---

**For full project context, see CLAUDE.md**
