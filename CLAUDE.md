# AI Project Guide

**Ver**: v3.57 | **Path**: `/home/deploy/stoner-system` | **Status**: Prod Ready | **DB**: PostgreSQL 16

---

## Critical Rules

1. **Version**: ⚠️ MUST increment `frontend/src/pages/AdminDashboard.vue` L9 after ANY change (backend/frontend/fix/feature)
   - Format: `<span>v3.X</span>` → `<span>v3.X+1</span>`
   - Applies to: code changes, bug fixes, new features, security patches, dependency updates
   - Reason: Version tracking for production debugging and rollback reference
2. **State**: Update `STATE.md` when tasks complete
3. **Deploy**: `./update-frontend.sh` (UI) | `./deploy.sh` (full)
4. **Workflow**: All ops are AI-driven, no human guides needed

---

## Structure

```
/home/deploy/stoner-system/
├── frontend/src/
│   ├── pages/AdminDashboard.vue          # L9=version, L2303=getBasePaymentMethod
│   ├── components/
│   │   ├── VirtualScrollTable.vue        # Payment table + filters
│   │   └── PaymentForm.vue               # Payment form
│   └── utils/api.ts
├── backend/src/
│   ├── server.ts                         # Main server (port 3001)
│   ├── db.ts                             # DB layer + batch operations
│   ├── routes/
│   │   ├── payments.ts                   # Payment API
│   │   └── customer-orders.ts            # Customer order API
│   ├── middleware/
│   │   ├── validation.ts                 # Input validation
│   │   ├── auth.ts                       # JWT auth (no env fallback)
│   │   └── security.ts                   # CSRF + rate limiting
│   └── utils/
│       └── audit-logger.ts               # Centralized audit logging
├── .env                                   # Environment config
├── CLAUDE.md                              # This file
├── STATE.md                               # Current state
└── Production: /var/www/stoner-system/
```

---

## DB Schema

### stores
`id, name, code, address, phone, manager, is_active, created_at`

### users
`id, username, password_hash, role, permissions(JSON), store_id, accessible_stores(JSON), is_active, created_at`

### payments
`uuid(PK), last_five, paid_at, amount, note, status, store_id, payment_method, created_at`

---

## Validation (v3.10)

```javascript
// backend/src/middleware/validation.ts
payment: {
  amount: isInt({ min: 0 }),           // Allow 0 for gifts
  note: isLength({ max: 1000 }),       // Max 1000 chars, NO character restrictions (v3.10)
  payment_method: [
    '現金', '匯款', '電子支付',
    '店內支出', '提領', '客訂單',
    '員工購物-現金', '員工購物-匯款', '員工購物-電子支付'  // v3.8
  ],
  last_five: /^\d{5}$/ (if 匯款 OR 員工購物-匯款)  // v3.8 updated

  // Auto-status logic (v3.8):
  // - 匯款 OR 員工購物-匯款 → '未確認'
  // - Others → '已入帳'
}
```

```vue
<!-- frontend/src/components/PaymentForm.vue -->
<input type="number" min="0" />
<textarea maxlength="1000" />
<select> <!-- 9 payment methods --> </select>
```

---

## Employee Shopping Feature (v3.8)

### Concept
Employee purchases are tracked separately but roll up to base payment methods in statistics.

### Payment Methods
- `員工購物-現金` → Statistics: 現金
- `員工購物-匯款` → Statistics: 匯款 (auto-status: 未確認)
- `員工購物-電子支付` → Statistics: 電子支付

### Implementation
```javascript
// AdminDashboard.vue L2303
const getBasePaymentMethod = (method: string): string => {
  if (method.startsWith('員工購物-')) {
    return method.replace('員工購物-', '')
  }
  return method
}
```

### Display Behavior
- **Payment records**: Show full name "員工購物-現金"
- **Statistics dashboard**: Grouped by base method "現金"
- **Filters**: Support both full name and base method

---

## Permissions

7 types: `manage_users`, `manage_stores`, `view_payments`, `edit_payments`, `delete_payments`, `view_reports`, `system_admin`

Admin = all permissions | User = selective

---

## Common Tasks

### ⚠️ Update Version (REQUIRED for ANY change)
**Location**: `frontend/src/pages/AdminDashboard.vue` Line 9

**Current**: `<span>v3.57</span>`

**When to increment**:
- ✅ Backend code changes (API, DB, middleware, routes)
- ✅ Frontend code changes (components, pages, styles)
- ✅ Bug fixes
- ✅ New features
- ✅ Security patches
- ✅ Dependency updates
- ✅ Configuration changes

**Steps**:
1. Open `frontend/src/pages/AdminDashboard.vue`
2. Find Line 9: `<span>v3.29</span>`
3. Increment: `<span>v3.30</span>` (3.29 → 3.30)
4. Save file
5. Rebuild frontend: `cd frontend && npx vite build`
6. Deploy: Copy to `/var/www/stoner-system/frontend/dist/`
7. Copy backend source to production: `sudo cp backend/src/* /var/www/stoner-system/backend/src/`
8. Restart backend: `pm2 restart stoner-backend`

**Version History**:
- v3.6: Form validation optimization & doc restructure
- v3.7: P0+P1 security fixes (password auth, CSRF, N+1, transactions, audit logging)
- v3.8: Employee shopping feature + statistics mapping (員工購物-現金/匯款/電子支付)
- v3.9: Payment method dropdown optimization with optgroup grouping
- v3.10: Remove note field character restrictions (allow all symbols, Chinese punctuation, emoji) + fix dashboard statistics label display
- v3.21: GA-style dashboard redesign
- v3.22: Add "clear data" test button (debug mode only) + increase import timeout to 2 minutes
- v3.23: Fix timezone issue in monthly statistics (PostgreSQL returns UTC, now correctly converts to Taiwan time)
- v3.24: Separate "匯款確認狀態" (pending/confirmed) into dedicated section in both daily and period statistics
- v3.25: Redesign period stats tab navigation to match GA-style (pill buttons instead of underline tabs)
- v3.26: Redesign month selector to slider-style with arrow navigation (more intuitive)
- v3.27: Remove "今日分店收款概覽" section (redundant with store filter)
- v3.28: Mobile RWD improvement - add tab switcher for 當日/期間 stats on mobile
- v3.29: Unified tab switcher for 當日/期間 stats on both mobile and desktop
- v3.47: Security hardening - fix TOCTOU race condition in user creation, protect health check endpoint, add pagination limits, remove JWT from URL for backup download, escape SQL LIKE wildcards, add bulk import rate limiting, fix timer memory leak
- v3.48: Security hardening round 2 - add backup filename whitelist validation, remove PostgreSQL direct SQL import, fix user update TOCTOU race condition, hide health check error details, remove debug logs from backup route
- v3.49: UI consistency update - unified styling for user management, store management, and audit logs to match dashboard GA-style (border instead of shadow, hover effects, transition animations)
- v3.50: Security hardening round 3 - pg_dump parameter validation, batch delete TOCTOU fix (atomic operation), password reset rate limiting, remove debug console.log, fix open redirect vulnerability
- v3.51-v3.56: Repository pattern migration, TypeScript fixes, AdminDashboard component refactoring (AuditTab, StoresTab, UsersTab)
- v3.57: Complete PostgreSQL migration - removed all SQLite dependencies (better-sqlite3), backup/restore now uses pg_dump/psql only

### Modify Validation
1. `backend/src/middleware/validation.ts`
2. Frontend HTML5 attrs
3. Test create + update

### Deploy (Manual)
```bash
# Frontend only (fast)
cd frontend && npx vite build
sudo cp -r dist/* /var/www/stoner-system/frontend/dist/

# Backend (TypeScript → running via tsx)
sudo cp -r backend/src/* /var/www/stoner-system/backend/src/
pm2 restart stoner-backend

# Full deployment
npm run build  # Both frontend and backend
# Then copy files as above
```

**Note**: PM2 runs TypeScript directly via `tsx`, not compiled JavaScript

---

## Env Vars

```bash
PORT=3000
JWT_SECRET=<random>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure>
FORCE_RESET_ADMIN_PASSWORD=false

# PostgreSQL (required)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=stoner_system
PG_USERNAME=stoner
PG_PASSWORD=<secure>
```

---

## Security

- JWT (8h expire)
- bcrypt (10 rounds)
- CSRF (double-submit cookie, timing-safe comparison) - v3.7 fixed
- Rate limit: global(500/15m), login(5/15m), API(100/1m)
- Validation: express-validator
- XSS: whitelist
- SQL injection: parameterized queries
- Auth: DB only (no env fallback) - v3.7 fixed
- Audit logging: Centralized with failure tracking - v3.7

---

## Performance

- N+1 fix: SQL IN (getPaymentsByUuids) - v3.7
- 20+ indexes
- Cache: node-cache (TTL 300-600s)
- PG pool: max 20
- CTE pagination
- Virtual scroll (frontend)
- Batch operations with transactions - v3.7

---

## Debug

```bash
lsof -ti:3001             # Backend status (port 3001)
lsof -ti:5173             # Frontend dev status
pm2 logs stoner-backend   # Production logs
pm2 restart stoner-backend # Restart backend
cd backend && npm run reset-password  # Reset pw

# Health check
curl http://localhost:3001/api/health

# Git operations
git status
git add .
git commit -m "message"
git push origin main  # Use SSH key: ~/.ssh/id_ed25519
```

---

## Emergency

### Rollback
```bash
cd /var/www/stoner-system/frontend
sudo rm -rf dist && sudo mv dist.backup dist
sudo systemctl reload nginx
```

### Reset Password
```bash
cd backend && npm run reset-password
# OR: FORCE_RESET_ADMIN_PASSWORD=true in .env + restart
```

---

## Notes

- ⚠️ **VERSION MUST INCREMENT**: Every change requires version bump (v3.X → v3.X+1)
- DB = source of truth for passwords (not .env)
- Always update STATE.md after completing tasks
- Test create + update operations after validation changes
- Frontend HMR, backend nodemon
- Version tracking helps with production debugging and rollback

---

**See STATE.md for current status**
