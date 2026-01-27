#!/bin/bash

# Mundi Wiki API 測試腳本

BASE_URL="http://localhost:3000"
TOKEN=""

echo "=========================================="
echo "   Mundi Wiki API 測試腳本"
echo "=========================================="
echo ""

# 測試服務器
echo "1. 測試服務器是否運行..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ "$response" = "200" ]; then
    echo "✅ 服務器正在運行"
else
    echo "❌ 服務器未運行 (HTTP $response)"
    echo "請先運行: npm run dev"
    exit 1
fi

echo ""
echo "2. 註冊管理員帳號..."
register_response=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@mundi.com",
    "password": "admin123",
    "role": "admin"
  }')

TOKEN=$(echo $register_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ 註冊成功"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "⚠️  用戶可能已存在，嘗試登入..."
    login_response=$(curl -s -X POST $BASE_URL/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@mundi.com",
        "password": "admin123"
      }')
    TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "✅ 登入成功"
        echo "Token: ${TOKEN:0:20}..."
    else
        echo "❌ 無法獲取 Token"
        exit 1
    fi
fi

echo ""
echo "3. 創建分類..."
curl -s -X POST $BASE_URL/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "角色",
    "description": "小說中的人物角色"
  }' | grep -q "successfully" && echo "✅ 分類'角色'創建成功" || echo "⚠️  分類可能已存在"

curl -s -X POST $BASE_URL/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "地點",
    "description": "故事發生的地點"
  }' | grep -q "successfully" && echo "✅ 分類'地點'創建成功" || echo "⚠️  分類可能已存在"

echo ""
echo "4. 創建標籤..."
curl -s -X POST $BASE_URL/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "魔法"}' | grep -q "successfully" && echo "✅ 標籤'魔法'創建成功" || echo "⚠️  標籤可能已存在"

curl -s -X POST $BASE_URL/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "戰士"}' | grep -q "successfully" && echo "✅ 標籤'戰士'創建成功" || echo "⚠️  標籤可能已存在"

echo ""
echo "5. 創建條目..."
curl -s -X POST $BASE_URL/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "艾瑞克·暴風劍",
    "content": "艾瑞克是一位強大的戰士，來自北方的暴風城。\n\n## 背景\n艾瑞克出生於貴族家庭，但在十歲時親眼目睹家族被屠殺。\n\n## 能力\n- 劍術大師\n- 戰術專家\n- 領導才能",
    "status": "published"
  }' | grep -q "successfully" && echo "✅ 條目'艾瑞克·暴風劍'創建成功" || echo "⚠️  條目可能已存在"

echo ""
echo "6. 獲取所有條目..."
entries_count=$(curl -s $BASE_URL/api/entries | grep -o '"entries":\[' | wc -l)
if [ "$entries_count" -gt 0 ]; then
    echo "✅ 成功獲取條目列表"
else
    echo "❌ 無法獲取條目"
fi

echo ""
echo "=========================================="
echo "   測試完成！"
echo "=========================================="
echo ""
echo "您可以訪問以下端點："
echo "  - 首頁: $BASE_URL"
echo "  - 條目列表: $BASE_URL/api/entries"
echo "  - 分類列表: $BASE_URL/api/categories"
echo "  - 標籤列表: $BASE_URL/api/tags"
echo ""
echo "您的 Token (用於需要認證的請求):"
echo "$TOKEN"
echo ""
echo "將此 token 用於 Authorization header:"
echo "Authorization: Bearer $TOKEN"
