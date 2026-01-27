# Mundi Wiki Backend

維基百科風格的小說世界觀後台 API 系統。支援條目管理、分類系統、標籤系統、搜尋功能和版本控制。

## 功能特點

- 📝 條目管理 (CRUD)
- 🏷️ 分類和標籤系統
- 🔍 全文搜尋
- 🔐 JWT 身份驗證
- 📚 版本歷史記錄
- 🔗 條目間關聯
- 👥 用戶角色管理 (Admin, Editor, Viewer)

## 技術棧

- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT 認證
- BCrypt 密碼加密

## 快速開始

### 安裝依賴

```bash
npm install
```

### 環境配置

複製 `.env.example` 為 `.env` 並配置以下環境變量：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mundi_wiki
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 啟動開發服務器

```bash
npm run dev
```

### 編譯 TypeScript

```bash
npm run build
```

### 啟動生產服務器

```bash
npm start
```

## API 端點

### 認證 API

#### 註冊用戶
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "role": "editor"
}
```

#### 登入
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 獲取用戶資料
```
GET /api/auth/profile
Authorization: Bearer <token>
```

### 條目 API

#### 獲取所有條目
```
GET /api/entries?page=1&limit=10&status=published
```

#### 獲取單個條目
```
GET /api/entries/:slug
```

#### 搜尋條目
```
GET /api/entries/search?q=關鍵字
```

#### 創建條目
```
POST /api/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "條目標題",
  "content": "條目內容",
  "categories": ["categoryId1", "categoryId2"],
  "tags": ["tagId1", "tagId2"],
  "relatedEntries": ["entryId1"],
  "status": "published"
}
```

#### 更新條目
```
PUT /api/entries/:slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新標題",
  "content": "新內容",
  "status": "published"
}
```

#### 刪除條目
```
DELETE /api/entries/:slug
Authorization: Bearer <token>
```

#### 獲取條目歷史版本
```
GET /api/entries/:slug/history
Authorization: Bearer <token>
```

### 分類 API

#### 獲取所有分類
```
GET /api/categories
```

#### 獲取單個分類及其條目
```
GET /api/categories/:slug
```

#### 創建分類
```
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "分類名稱",
  "description": "分類描述",
  "parent": "parentCategoryId"
}
```

#### 更新分類
```
PUT /api/categories/:slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新分類名稱",
  "description": "新描述"
}
```

#### 刪除分類
```
DELETE /api/categories/:slug
Authorization: Bearer <token>
```

### 標籤 API

#### 獲取所有標籤
```
GET /api/tags
```

#### 獲取單個標籤及其條目
```
GET /api/tags/:slug
```

#### 創建標籤
```
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "標籤名稱"
}
```

#### 更新標籤
```
PUT /api/tags/:slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新標籤名稱"
}
```

#### 刪除標籤
```
DELETE /api/tags/:slug
Authorization: Bearer <token>
```

## 資料模型

### User (用戶)
- username: 用戶名
- email: 電子郵件
- password: 密碼 (加密)
- role: 角色 (admin, editor, viewer)

### Entry (條目)
- title: 標題
- content: 內容
- slug: URL 友好的標識符
- categories: 分類列表
- tags: 標籤列表
- relatedEntries: 相關條目
- author: 作者
- status: 狀態 (draft, published)
- views: 瀏覽次數

### Category (分類)
- name: 名稱
- slug: URL 友好的標識符
- description: 描述
- parent: 父分類

### Tag (標籤)
- name: 名稱
- slug: URL 友好的標識符

### EntryHistory (歷史版本)
- entryId: 條目 ID
- title: 標題
- content: 內容
- version: 版本號
- editedBy: 編輯者

## 權限說明

- **Admin**: 完全權限，可以刪除任何資源
- **Editor**: 可以創建和編輯條目、分類、標籤
- **Viewer**: 只能查看內容

## 前端整合建議

1. 使用條目 API 建立維基百科式的內容展示
2. 實作搜尋功能來快速查找條目
3. 顯示條目的分類和標籤，提供過濾功能
4. 展示相關條目，建立知識網絡
5. 提供編輯歷史查看功能

## License

ISC
