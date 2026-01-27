#!/bin/bash

echo "=========================================="
echo "   Mundi Wiki Backend - 快速啟動腳本"
echo "=========================================="
echo ""

# 檢查 MongoDB
echo "🔍 檢查 MongoDB..."
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB 已安裝"
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB 正在運行"
    else
        echo "⚠️  MongoDB 已安裝但未運行"
        echo "   請運行: sudo systemctl start mongod"
    fi
elif docker ps &> /dev/null; then
    if docker ps | grep -q mongo; then
        echo "✅ MongoDB 容器正在運行"
    else
        echo "⚠️  Docker 可用，但 MongoDB 容器未運行"
        echo "   正在啟動 MongoDB 容器..."
        docker run -d --name mundi-mongodb -p 27017:27017 mongo:latest
        sleep 3
        if docker ps | grep -q mongo; then
            echo "✅ MongoDB 容器已啟動"
        else
            echo "❌ 無法啟動 MongoDB 容器"
        fi
    fi
else
    echo "❌ 未檢測到 MongoDB"
    echo ""
    echo "請選擇安裝方法："
    echo "1. 使用 Docker (推薦)："
    echo "   curl -fsSL https://get.docker.com | sh"
    echo "   docker run -d --name mundi-mongodb -p 27017:27017 mongo:latest"
    echo ""
    echo "2. 使用 MongoDB Atlas (雲端，免費)："
    echo "   訪問 https://www.mongodb.com/cloud/atlas"
    echo ""
    echo "詳細說明請查看 INSTALL_GUIDE.md"
    exit 1
fi

echo ""
echo "🚀 啟動應用..."
echo "   訪問 http://localhost:3000"
echo "   按 Ctrl+C 停止"
echo ""

npm run dev
