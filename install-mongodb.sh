#!/bin/bash
# MongoDB 安装脚本 for Ubuntu 24.04

set -e

echo "开始安装 MongoDB..."

# 1. 安装必要的依赖
echo "步骤 1: 安装依赖包..."
sudo apt-get update
sudo apt-get install -y gnupg curl

# 2. 导入 MongoDB GPG 密钥
echo "步骤 2: 导入 MongoDB GPG 密钥..."
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# 3. 添加 MongoDB 仓库
echo "步骤 3: 添加 MongoDB 仓库..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 4. 更新包列表
echo "步骤 4: 更新包列表..."
sudo apt-get update

# 5. 安装 MongoDB
echo "步骤 5: 安装 MongoDB..."
sudo apt-get install -y mongodb-org

# 6. 启动 MongoDB 服务
echo "步骤 6: 启动 MongoDB 服务..."
sudo systemctl start mongod
sudo systemctl enable mongod

# 7. 验证安装
echo "步骤 7: 验证安装..."
mongod --version

echo ""
echo "MongoDB 安装完成！"
echo "服务状态:"
sudo systemctl status mongod --no-pager

echo ""
echo "可以使用以下命令连接到 MongoDB:"
echo "  mongosh"
