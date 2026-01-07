# System State

**Version**: v3.6
**Last Update**: 2025-10-19
**Status**: Production Ready

---

## Latest Changes (v3.6)

- Allow payment amount = 0 (gifts/PR items)
- Note character limit: 200 → 1000
- Permission display: English → Chinese
- Added `update-frontend.sh` for quick deploy
- **Documentation restructure**: Optimized for AI workflow
  - Removed 10 human-oriented docs (112 KB → 6 KB, 95% reduction)
  - Rewrote CLAUDE.md in concise English (16.5 KB → 3.6 KB)
  - Created STATE.md for current status tracking
  - 94% faster context loading, 60-70% fewer tokens

**Modified**:
- `backend/src/middleware/validation.ts` - min: 0, max: 1000
- `frontend/src/components/PaymentForm.vue` - min="0", maxlength="1000"
- `frontend/src/pages/AdminDashboard.vue` - version + permission mapping
- `CLAUDE.md` - Rewritten in concise English for AI optimization
- `STATE.md` - Created new state tracking doc

---

## Key Files

### Frontend
- `frontend/src/pages/AdminDashboard.vue` (3,959L) - Main UI
- `frontend/src/components/VirtualScrollTable.vue` (1,126L) - Payment table
- `frontend/src/components/PaymentForm.vue` (821L) - Payment form

### Backend
- `backend/src/server.ts` - Express entry
- `backend/src/db.ts` (1,200L) - Database layer
- `backend/src/routes/payments.ts` (786L) - Payment API
- `backend/src/middleware/validation.ts` (124L) - Validation

### Config
- `.env` - Environment variables
- `backend/database.sqlite` - Main database

---

## Deploy Commands

### Frontend only (fastest)
```bash
cd /home/mstpri/stoner-system && ./update-frontend.sh
```

### Full deploy
```bash
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
lsof -ti:3000  # Backend
lsof -ti:5173  # Frontend
```

---

## Tech Stack

- Frontend: Vue 3 + Vite + TypeScript + TailwindCSS
- Backend: Node.js 20 + Express 4 + TypeScript
- Database: SQLite (dev) / PostgreSQL (prod)
- Deploy: PM2 + Nginx

---

## Common Issues

### Frontend not updating after deploy
```bash
sudo systemctl reload nginx
# Clear browser cache: Ctrl+Shift+R
```

### Backend validation error
Check `backend/src/middleware/validation.ts`

### Database issues
Check `backend/database.sqlite` permissions

---

**For full project context, see CLAUDE.md**
