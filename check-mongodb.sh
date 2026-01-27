#!/bin/bash
# MongoDB 检查脚本

echo "=== MongoDB 安装检查 ==="
echo ""

# 检查 mongod 命令
echo "1. 检查 mongod 命令:"
if command -v mongod &> /dev/null; then
    echo "   ✓ mongod 已安装"
    mongod --version | head -1
else
    echo "   ✗ mongod 未找到"
fi

echo ""

# 检查 mongo/mongosh 客户端
echo "2. 检查 MongoDB 客户端:"
if command -v mongosh &> /dev/null; then
    echo "   ✓ mongosh 已安装"
    mongosh --version
elif command -v mongo &> /dev/null; then
    echo "   ✓ mongo 已安装"
    mongo --version | head -1
else
    echo "   ✗ MongoDB 客户端未找到"
fi

echo ""

# 检查服务状态
echo "3. 检查 MongoDB 服务状态:"
if systemctl is-active --quiet mongod 2>/dev/null; then
    echo "   ✓ MongoDB 服务正在运行"
    systemctl status mongod --no-pager | grep "Active:"
elif pgrep mongod > /dev/null; then
    echo "   ✓ MongoDB 进程正在运行 (不使用 systemd)"
    pgrep mongod | xargs ps -p
else
    echo "   ✗ MongoDB 服务未运行"
fi

echo ""

# 检查端口
echo "4. 检查 MongoDB 端口 (27017):"
if netstat -tuln 2>/dev/null | grep -q ":27017" || ss -tuln 2>/dev/null | grep -q ":27017"; then
    echo "   ✓ MongoDB 正在监听端口 27017"
else
    echo "   ✗ 端口 27017 未被监听"
fi

echo ""

# 检查数据目录
echo "5. 检查 MongoDB 数据目录:"
if [ -d "/var/lib/mongodb" ]; then
    echo "   ✓ 数据目录存在: /var/lib/mongodb"
    echo "   大小: $(du -sh /var/lib/mongodb 2>/dev/null | cut -f1)"
elif [ -d "/data/db" ]; then
    echo "   ✓ 数据目录存在: /data/db"
    echo "   大小: $(du -sh /data/db 2>/dev/null | cut -f1)"
else
    echo "   ⚠ 标准数据目录未找到"
fi

echo ""

# 检查配置文件
echo "6. 检查 MongoDB 配置文件:"
if [ -f "/etc/mongod.conf" ]; then
    echo "   ✓ 配置文件存在: /etc/mongod.conf"
else
    echo "   ✗ 配置文件未找到"
fi

echo ""

# 尝试连接测试
echo "7. 测试连接:"
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet 2>/dev/null; then
        echo "   ✓ 成功连接到 MongoDB"
    else
        echo "   ✗ 无法连接到 MongoDB"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.version()" --quiet 2>/dev/null; then
        echo "   ✓ 成功连接到 MongoDB"
    else
        echo "   ✗ 无法连接到 MongoDB"
    fi
else
    echo "   - 跳过（客户端未安装）"
fi

echo ""
echo "=== 检查完成 ==="
