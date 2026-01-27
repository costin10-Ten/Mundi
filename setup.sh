#!/bin/bash

# Mundi 維基系統快速安裝腳本

echo "🚀 開始安裝 Mundi 維基系統..."

# 檢查 Python 版本
if ! command -v python3 &> /dev/null; then
    echo "❌ 錯誤: 未找到 Python 3"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 創建虛擬環境
if [ ! -d "venv" ]; then
    echo "📦 創建虛擬環境..."
    python3 -m venv venv
fi

# 啟動虛擬環境
echo "🔄 啟動虛擬環境..."
source venv/bin/activate

# 安裝依賴
echo "📚 安裝依賴包..."
pip install -r requirements.txt

# 數據庫遷移
echo "🗄️ 執行數據庫遷移..."
python manage.py makemigrations
python manage.py migrate

# 創建超級用戶
echo ""
echo "👤 創建管理員帳號..."
python manage.py createsuperuser

# 收集靜態文件
echo "📁 收集靜態文件..."
python manage.py collectstatic --noinput

echo ""
echo "✨ 安裝完成!"
echo ""
echo "啟動服務器:"
echo "  python manage.py runserver"
echo ""
echo "訪問:"
echo "  管理後台: http://localhost:8000/admin/"
echo "  REST API: http://localhost:8000/api/"
echo ""
