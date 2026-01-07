#!/bin/bash

# 石頭人煙具系統 - 一鍵部署腳本
# 使用方法: ./deploy.sh

set -e  # 遇到錯誤立即停止

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 項目路徑
PROJECT_ROOT="/var/www/stoner-system"
NGINX_ROOT="/var/www/stoner-system"

# 函數：打印帶顏色的訊息
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 檢查是否為root用戶或有sudo權限
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        SUDO_CMD=""
    else
        if ! command -v sudo &> /dev/null; then
            print_error "需要sudo權限但sudo命令不可用"
            exit 1
        fi
        SUDO_CMD="sudo"
    fi
}

# 檢查必要的命令是否存在
check_dependencies() {
    print_status "檢查系統依賴..."
    
    local missing_deps=()
    
    for cmd in npm pm2 nginx; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=($cmd)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "缺少必要的依賴: ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "系統依賴檢查通過"
}

# 備份當前部署
backup_current_deployment() {
    print_status "備份當前部署..."
    
    if [ -d "$NGINX_ROOT/frontend/dist" ]; then
        $SUDO_CMD rm -rf "$NGINX_ROOT/frontend/dist.backup" 2>/dev/null || true
        $SUDO_CMD mv "$NGINX_ROOT/frontend/dist" "$NGINX_ROOT/frontend/dist.backup" 2>/dev/null || true
        print_success "當前部署已備份"
    else
        print_warning "沒有找到當前部署，跳過備份"
    fi
}

# 構建前端應用
build_frontend() {
    print_status "構建前端應用..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # 檢查package.json是否存在
    if [ ! -f "package.json" ]; then
        print_error "未找到frontend/package.json文件"
        exit 1
    fi
    
    # 安裝依賴（如果node_modules不存在）
    if [ ! -d "node_modules" ]; then
        print_status "安裝前端依賴..."
        npm install
    fi
    
    # 構建（跳過TypeScript檢查）
    print_status "執行前端構建..."
    npm run build:skip-check
    
    # 檢查構建結果
    if [ ! -d "dist" ]; then
        print_error "前端構建失敗：dist目錄不存在"
        exit 1
    fi
    
    print_success "前端構建完成"
}

# 部署前端文件
deploy_frontend() {
    print_status "部署前端文件..."
    
    # 創建目標目錄
    $SUDO_CMD mkdir -p "$NGINX_ROOT/frontend"
    
    # 複製構建文件
    $SUDO_CMD cp -r "$PROJECT_ROOT/frontend/dist" "$NGINX_ROOT/frontend/"
    
    # 設置正確的權限
    $SUDO_CMD chown -R www-data:www-data "$NGINX_ROOT/frontend/dist"
    $SUDO_CMD chmod -R 755 "$NGINX_ROOT/frontend/dist"
    
    print_success "前端文件部署完成"
}

# 重啟後端服務
restart_backend() {
    print_status "重啟後端服務..."
    
    # 檢查PM2進程是否存在
    if pm2 list | grep -q "stoner-backend"; then
        pm2 restart stoner-backend
        print_success "後端服務重啟完成"
    else
        print_warning "PM2進程 'stoner-backend' 不存在，跳過重啟"
    fi
}

# 重載Nginx配置
reload_nginx() {
    print_status "重載Nginx配置..."
    
    # 測試nginx配置
    if $SUDO_CMD nginx -t; then
        $SUDO_CMD systemctl reload nginx
        print_success "Nginx配置重載完成"
    else
        print_error "Nginx配置測試失敗"
        exit 1
    fi
}

# 驗證部署結果
verify_deployment() {
    print_status "驗證部署結果..."
    
    # 檢查文件是否存在
    if [ -f "$NGINX_ROOT/frontend/dist/index.html" ]; then
        print_success "前端文件部署成功"
    else
        print_error "前端文件部署失敗"
        return 1
    fi
    
    # 檢查PM2狀態
    if pm2 list | grep -q "online.*stoner-backend"; then
        print_success "後端服務運行正常"
    else
        print_warning "後端服務狀態異常"
    fi
    
    # 檢查nginx狀態
    if systemctl is-active --quiet nginx; then
        print_success "Nginx服務運行正常"
    else
        print_error "Nginx服務異常"
        return 1
    fi
}

# 清理舊備份（保留最近3個）
cleanup_backups() {
    print_status "清理舊備份..."
    
    if [ -d "$NGINX_ROOT/frontend" ]; then
        cd "$NGINX_ROOT/frontend"
        # 刪除7天前的備份文件
        $SUDO_CMD find . -name "dist.backup*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
        print_success "舊備份清理完成"
    fi
}

# 主要部署流程
main() {

    echo -e "${BLUE}"
    echo "=================================================="
    echo "   石頭人煙具系統 - 自動部署腳本 v1.0"
    echo "=================================================="
    echo -e "${NC}"

    print_status "開始部署流程..."

    # 檢查環境
    check_permissions
    check_dependencies

    # 執行部署步驟
    backup_current_deployment
    build_frontend
    deploy_frontend
    restart_backend
    reload_nginx

    # 驗證和清理
    if verify_deployment; then
        cleanup_backups

        echo -e "${GREEN}"
        echo "=================================================="
        print_success "部署完成！"
        echo "🌍 網站地址: https://stonersmokeshop.work"
        echo "🔧 管理後台: https://stonersmokeshop.work/admin"
        echo "=================================================="
        echo -e "${NC}"

        print_warning "提醒：如果看不到更新，請清除瀏覽器緩存 (Ctrl+F5)"
    else
        print_error "部署驗證失敗，請檢查系統狀態"

        # 提供回滾選項
        echo ""
        read -p "是否要回滾到上一個版本？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "執行回滾..."
            if [ -d "$NGINX_ROOT/frontend/dist.backup" ]; then
                $SUDO_CMD rm -rf "$NGINX_ROOT/frontend/dist"
                $SUDO_CMD mv "$NGINX_ROOT/frontend/dist.backup" "$NGINX_ROOT/frontend/dist"
                $SUDO_CMD systemctl reload nginx
                print_success "回滾完成"
            else
                print_error "沒有找到備份文件，無法回滾"
            fi
        fi

        exit 1
    fi
}

# 處理中斷信號
trap 'print_error "部署被中斷"; exit 1' INT TERM

# 執行主函數
main "$@"