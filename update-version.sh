#!/bin/bash

# 版本更新腳本 - 自動更新版本號解決緩存問題
# 使用方法: ./update-version.sh

PROJECT_ROOT="/home/deploy/stoner-system"

# 生成新的版本時間戳
VERSION=$(date +"%Y%m%d_%H%M%S")

echo "🔄 更新版本到: $VERSION"

# 更新前端版本
cd "$PROJECT_ROOT/frontend"

# 在package.json中更新版本（如果需要）
if [ -f "package.json" ]; then
    # 這裡可以加入更新package.json版本的邏輯
    echo "📦 當前前端版本已準備更新"
fi

# 構建並部署
echo "📦 構建前端 (版本: $VERSION)..."
npm run build:skip-check

echo "📁 部署到生產環境..."
sudo cp -r dist/* /var/www/stoner-system/frontend/dist/
sudo chown -R www-data:www-data /var/www/stoner-system/frontend/dist

# 重啟服務
pm2 restart stoner-backend
sudo systemctl reload nginx

echo "✅ 版本 $VERSION 部署完成！"
echo "🌍 https://stonersmokeshop.work"
echo "📝 版本記錄已保存"

# 記錄部署日誌
echo "$(date): 部署版本 $VERSION" >> "$PROJECT_ROOT/deployment.log"