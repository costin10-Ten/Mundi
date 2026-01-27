# Mundi 世界觀維基系統

一個專為小說創作設計的維基百科風格後台管理系統,基於 Django + Django REST Framework 構建。

## 🌟 核心特性

- ✍️ **富文本編輯**: 集成 CKEditor,支援格式化文字、圖片、表格
- 🔗 **內部連結**: 使用 `[[條目名稱]]` 語法快速建立條目間連結
- 📚 **多層級分類**: 樹狀分類結構,靈活組織世界觀元素
- 🏷️ **標籤系統**: 多維度標記和快速檢索
- 📸 **媒體管理**: 圖片、地圖、文件等資源統一管理
- ⏱️ **版本控制**: 完整的修改歷史記錄,支援版本恢復
- 🔍 **全文搜索**: 快速查找任意內容
- 📅 **時間線**: 管理故事事件的時序關係
- 🎨 **自訂類型**: 角色、地點、事件、物品等可擴展類型

## 📋 快速開始

詳細安裝和使用說明請查看 [SETUP.md](SETUP.md)

### 基本步驟

```bash
# 1. 安裝依賴
pip install -r requirements.txt

# 2. 數據庫遷移
python manage.py makemigrations
python manage.py migrate

# 3. 創建管理員帳號
python manage.py createsuperuser

# 4. 啟動服務器
python manage.py runserver
```

訪問 http://localhost:8000/admin/ 開始使用!

## 🏗️ 技術架構

- **後端**: Django 4.2+
- **API**: Django REST Framework
- **富文本**: CKEditor
- **數據庫**: SQLite (開發) / PostgreSQL (生產推薦)
- **分類管理**: django-mptt
- **標籤**: django-taggit
- **版本控制**: django-simple-history

## 📖 API 文檔

REST API 端點:
- `/api/entries/` - 條目管理
- `/api/categories/` - 分類管理
- `/api/media/` - 媒體管理
- `/api/timelines/` - 時間線管理

詳細 API 說明請查看 [SETUP.md](SETUP.md#api-端點)

## 📝 使用案例

適用於:
- 小說世界觀構建
- 角色設定管理
- 故事情節追蹤
- 虛構世界百科

## 📄 授權

MIT License
