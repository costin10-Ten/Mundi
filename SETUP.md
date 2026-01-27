# Mundi 維基後台系統 - 安裝指南

## 系統概述

Mundi 是一個專為小說世界觀管理設計的維基百科風格後台系統,基於 Django + Django REST Framework 構建。

### 核心功能

✨ **條目管理**
- 富文本編輯器 (CKEditor)
- 內部連結系統 `[[條目名稱]]`
- 版本歷史追蹤
- 多類型條目支援 (角色、地點、事件、物品等)

📁 **分類系統**
- 無限層級樹狀分類 (MPTT)
- 標籤雲系統
- 靈活的組織結構

🖼️ **媒體管理**
- 圖片、地圖、文件上傳
- 自動圖片尺寸識別
- 媒體文件關聯

📅 **時間線系統**
- 事件時序管理
- 虛構日期系統支援
- 可視化時間軸

🔍 **搜索功能**
- 全文搜索
- 多條件篩選
- 標籤搜索

## 技術架構

- **後端框架**: Django 4.2+
- **API 框架**: Django REST Framework 3.14+
- **富文本編輯**: CKEditor
- **分類管理**: django-mptt (樹狀結構)
- **標籤系統**: django-taggit
- **版本控制**: django-simple-history
- **數據庫**: SQLite (開發) / PostgreSQL (生產)

## 快速開始

### 1. 安裝依賴

```bash
# 創建虛擬環境 (推薦)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安裝依賴包
pip install -r requirements.txt
```

### 2. 數據庫遷移

```bash
# 生成遷移文件
python manage.py makemigrations

# 執行遷移
python manage.py migrate
```

### 3. 創建超級用戶

```bash
python manage.py createsuperuser
```

### 4. 收集靜態文件

```bash
python manage.py collectstatic --noinput
```

### 5. 啟動開發服務器

```bash
python manage.py runserver
```

訪問:
- 管理後台: http://localhost:8000/admin/
- REST API: http://localhost:8000/api/

## API 端點

### 條目 (Entries)
- `GET /api/entries/` - 列表
- `GET /api/entries/{slug}/` - 詳細
- `POST /api/entries/` - 創建
- `PUT /api/entries/{slug}/` - 更新
- `DELETE /api/entries/{slug}/` - 刪除
- `GET /api/entries/{slug}/history/` - 歷史版本
- `POST /api/entries/{slug}/restore/` - 恢復版本
- `GET /api/entries/search/?q=關鍵字` - 搜索
- `GET /api/entries/featured/` - 精選條目
- `GET /api/entries/recent/` - 最近更新
- `GET /api/entries/popular/` - 熱門條目

### 分類 (Categories)
- `GET /api/categories/` - 列表
- `GET /api/categories/tree/` - 樹狀結構
- `GET /api/categories/{slug}/` - 詳細

### 條目類型 (Entry Types)
- `GET /api/entry-types/` - 列表
- `GET /api/entry-types/{slug}/` - 詳細

### 媒體 (Media)
- `GET /api/media/` - 列表
- `POST /api/media/` - 上傳
- `GET /api/media/by_type/?type=image` - 按類型篩選

### 時間線 (Timelines)
- `GET /api/timelines/` - 列表
- `GET /api/timelines/{id}/` - 詳細

## 使用指南

### 內部連結語法

在條目內容中使用 `[[條目名稱]]` 創建內部連結:

```
這是一段文字,提到了 [[主角名字]] 和 [[重要地點]]。
```

系統會自動:
1. 識別內部連結
2. 建立條目關聯
3. 渲染為可點擊的超連結

### 自訂欄位

每個條目都支援 JSON 格式的自訂欄位,例如:

```json
{
  "age": 25,
  "height": "180cm",
  "weapon": "長劍",
  "special_ability": "時間操控"
}
```

### 版本控制

系統自動記錄所有條目的修改歷史:
- 查看歷史: `GET /api/entries/{slug}/history/`
- 恢復版本: `POST /api/entries/{slug}/restore/`

## 數據模型

### Entry (條目)
- 標題、摘要、內容
- 條目類型 (角色/地點/事件等)
- 分類、標籤
- 相關條目
- 版本歷史
- 自訂欄位

### Category (分類)
- 無限層級樹狀結構
- 支援圖示、排序

### Media (媒體)
- 圖片、地圖、文件
- 自動元數據提取
- 條目關聯

### Timeline (時間線)
- 事件序列管理
- 自訂日期格式

## 進階配置

### 切換到 PostgreSQL

編輯 `backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mundi_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 啟用 Elasticsearch 全文搜索

安裝 elasticsearch-dsl-py 和配置搜索引擎以獲得更強大的搜索功能。

### 生產環境部署

1. 設置環境變量
2. 修改 `DEBUG = False`
3. 配置 `ALLOWED_HOSTS`
4. 使用 Gunicorn/uWSGI
5. 配置 Nginx 反向代理
6. 設置 HTTPS

## 開發計劃

- [ ] Elasticsearch 整合
- [ ] 條目導出 (Markdown/JSON)
- [ ] 批量導入
- [ ] 關係圖視覺化
- [ ] 前端管理界面
- [ ] 多語言支援
- [ ] API 認證 (JWT)

## 技術支援

如有問題,請查看:
- Django 官方文檔: https://docs.djangoproject.com/
- DRF 官方文檔: https://www.django-rest-framework.org/

## 授權

本專案使用 MIT 授權。
