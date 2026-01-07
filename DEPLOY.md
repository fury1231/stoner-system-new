# Deploy to VPS

## Quick Deploy (1 command)

### SSH to VPS then run:
```bash
cd /var/www/stoner-system && git pull && ./deploy.sh
```

That's it!

---

## What it does:
1. Pull latest code from git
2. Build frontend
3. Deploy to Nginx
4. Restart backend (PM2)
5. Reload Nginx

---

## If first time deploying:

```bash
# 1. Clone repo
cd /var/www
git clone <your-repo-url> stoner-system

# 2. Setup env
cd stoner-system
cp .env.example .env
nano .env  # Edit JWT_SECRET, ADMIN_PASSWORD

# 3. Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 4. Deploy
./deploy.sh
```

---

## Troubleshoot

### Check status
```bash
pm2 status                    # Backend status
sudo systemctl status nginx   # Nginx status
```

### View logs
```bash
pm2 logs stoner-backend       # Backend logs
sudo tail -f /var/log/nginx/error.log  # Nginx errors
```

### Rollback
```bash
cd /var/www/stoner-system/frontend
sudo rm -rf dist && sudo mv dist.backup dist
sudo systemctl reload nginx
```

---

**Current Version**: v3.6
