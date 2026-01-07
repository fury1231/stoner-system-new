#!/bin/bash

# 快速部署腳本 - 適用於小修改
# 使用方法: ./quick-deploy.sh

echo "🚀 快速部署中..."

# 切換到項目目錄
cd /home/deploy/stoner-system

# 1. 構建前端
echo "📦 構建前端..."
cd frontend && npm run build:skip-check && cd ..

# 2. 部署前端文件
echo "📁 部署文件..."
sudo cp -r frontend/dist/* /var/www/stoner-system/frontend/dist/
sudo chown -R www-data:www-data /var/www/stoner-system/frontend/dist

# 3. 重啟服務
echo "🔄 重啟服務..."
pm2 restart stoner-backend
sudo systemctl reload nginx

echo "✅ 部署完成！"
echo "🌍 https://stonersmokeshop.work"
echo ""
echo "💡 提醒：清除瀏覽器緩存 (Ctrl+F5) 以查看更新"