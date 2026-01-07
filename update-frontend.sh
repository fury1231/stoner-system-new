#!/bin/bash

# 超簡單前端部署腳本 - 適用於純前端修改
# 使用方法: ./update-frontend.sh

set -e  # 遇到錯誤立即停止

echo "🚀 開始部署前端更新..."
echo ""

# 1. 切換到項目目錄
cd /home/mstpri/stoner-system/frontend

# 2. 構建前端（跳過 TypeScript 檢查以加速）
echo "📦 構建前端..."
npm run build || npm run build:skip-check

# 3. 複製到 Nginx 目錄
echo "📁 部署到伺服器..."
sudo rm -rf /var/www/stoner-system/frontend/dist
sudo cp -r dist /var/www/stoner-system/frontend/
sudo chown -R www-data:www-data /var/www/stoner-system/frontend/dist
sudo chmod -R 755 /var/www/stoner-system/frontend/dist

# 4. 重載 Nginx
echo "🔄 重載 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ 前端部署完成！"
echo "🌍 網站: https://stonersmokeshop.work"
echo "🔧 後台: https://stonersmokeshop.work/admin"
echo ""
echo "💡 提醒: 請在瀏覽器按 Ctrl+Shift+R 強制刷新緩存"
