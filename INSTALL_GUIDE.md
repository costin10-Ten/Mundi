# Mundi Wiki 安裝指南

## ✅ 已完成的步驟

1. ✅ Node.js 已安裝 (v22.22.0)
2. ✅ 項目依賴已安裝
3. ✅ 環境配置文件 (.env) 已創建

## 🔧 需要安裝 MongoDB

您的系統需要安裝 MongoDB 才能運行這個應用。以下是幾種安裝方法：

### 方法 1: 使用 Docker（推薦，最簡單）

```bash
# 1. 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. 啟動 MongoDB 容器
docker run -d \
  --name mundi-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# 3. 檢查 MongoDB 是否運行
docker ps | grep mongo
```

### 方法 2: 使用 MongoDB Atlas（雲端，免費）

1. 訪問 https://www.mongodb.com/cloud/atlas
2. 註冊免費帳號
3. 創建一個免費的集群
4. 獲取連接字符串
5. 更新 `.env` 文件中的 `MONGODB_URI`

例如：
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mundi_wiki
```

### 方法 3: 本地安裝 MongoDB

#### Ubuntu/Debian:
```bash
# 安裝 MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 啟動 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS:
```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows:
1. 下載 MongoDB 安裝程序：https://www.mongodb.com/try/download/community
2. 運行安裝程序
3. 選擇 "Complete" 安裝
4. 啟動 MongoDB 服務

## 🚀 啟動應用

完成 MongoDB 安裝後，運行：

```bash
# 開發模式（自動重啟）
npm run dev

# 或編譯後運行
npm run build
npm start
```

應用將在 http://localhost:3000 啟動

## 🧪 測試 API

應用啟動後，可以用以下命令測試：

```bash
# 測試首頁
curl http://localhost:3000

# 註冊用戶
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## 📱 推薦的測試工具

- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **Thunder Client**: VS Code 擴展

## ❓ 需要幫助？

如果遇到問題，請檢查：
1. MongoDB 是否正在運行：`sudo systemctl status mongod` 或 `docker ps`
2. 端口 3000 是否被佔用：`lsof -i :3000`
3. `.env` 文件配置是否正確
