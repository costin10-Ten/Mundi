# 🚀 開始使用 Mundi Wiki

## ✅ 已完成的設置

- ✅ Node.js 項目已初始化
- ✅ 所有依賴已安裝
- ✅ 環境配置文件已創建
- ✅ TypeScript 已配置
- ✅ API 測試腳本已準備好

## 📋 下一步：安裝 MongoDB

您需要 MongoDB 才能運行這個應用。選擇以下方法之一：

### 🐳 方法 1: Docker（最推薦）

如果您有 Docker，只需運行：

```bash
docker run -d --name mundi-mongodb -p 27017:27017 mongo:latest
```

### ☁️ 方法 2: MongoDB Atlas（雲端免費版）

1. 訪問 https://www.mongodb.com/cloud/atlas/register
2. 註冊免費帳號（永久免費 512MB）
3. 創建一個集群（選擇免費版 M0）
4. 點擊 "Connect" → "Connect your application"
5. 複製連接字符串
6. 編輯 `.env` 文件，更新 `MONGODB_URI`：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mundi_wiki
   ```

### 💻 方法 3: 本地安裝

#### Ubuntu/Linux:
```bash
# 添加 MongoDB 儲存庫
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 啟動
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows:
下載並安裝：https://www.mongodb.com/try/download/community

## 🎯 啟動應用

完成 MongoDB 安裝後：

```bash
# 方式 1: 使用快速啟動腳本
./quick-start.sh

# 方式 2: 手動啟動
npm run dev
```

應用會在 http://localhost:3000 啟動

## 🧪 測試 API

應用啟動後，在**新的終端窗口**運行：

```bash
./test-api.sh
```

這會自動：
- 註冊一個管理員帳號
- 創建示例分類和標籤
- 創建一個示例條目
- 顯示 API token

## 📱 使用 API

### 快速測試

```bash
# 查看 API 信息
curl http://localhost:3000

# 查看所有條目
curl http://localhost:3000/api/entries

# 查看所有分類
curl http://localhost:3000/api/categories

# 查看所有標籤
curl http://localhost:3000/api/tags
```

### 使用 Postman/Thunder Client

導入 `api-examples.json` 文件到您的 API 測試工具中，裡面包含所有 API 的示例請求。

## 📚 完整文檔

- 詳細 API 文檔：`README.md`
- 安裝指南：`INSTALL_GUIDE.md`
- API 示例集合：`api-examples.json`

## ⚡ 常見問題

### Q: 運行 `npm run dev` 時出現連接錯誤？
A: 確保 MongoDB 正在運行：
```bash
# 檢查 Docker
docker ps | grep mongo

# 或檢查本地 MongoDB
sudo systemctl status mongod
```

### Q: 端口 3000 已被佔用？
A: 編輯 `.env` 文件，修改 `PORT=3000` 為其他端口

### Q: 忘記管理員密碼？
A: 重新運行 `./test-api.sh` 或使用 MongoDB 工具直接修改數據庫

## 🎉 開始創建您的小說世界觀！

現在您可以：
1. 創建角色、地點、事件等條目
2. 使用分類組織內容
3. 使用標籤建立關聯
4. 搜尋和瀏覽條目
5. 查看編輯歷史

祝您創作愉快！ 📖✨
