#!/bin/bash

echo "🔍 检查E-Commerce服务状态..."
echo "=================================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker Desktop"
    exit 1
fi

echo "✅ Docker运行正常"
echo ""

# 检查容器状态
echo "📦 容器状态："
echo "----------"
docker-compose ps

echo ""
echo "🌐 服务连接测试："
echo "----------------"

# 测试后端API健康检查
echo -n "后端API (http://localhost:3000/health): "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 正常"
    # 获取健康检查详情
    echo "   响应: $(curl -s http://localhost:3000/health)"
else
    echo "❌ 无法连接"
fi

# 测试PostgreSQL连接
echo -n "PostgreSQL数据库 (localhost:5432): "
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ 正常"
else
    echo "❌ 无法连接"
fi

# 测试MongoDB连接
echo -n "MongoDB数据库 (localhost:27017): "
if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ 正常"
else
    echo "❌ 无法连接"
fi

# 测试PgAdmin
echo -n "PgAdmin管理界面 (http://localhost:8080): "
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ 正常"
else
    echo "❌ 无法连接"
fi

echo ""
echo "📊 资源使用情况："
echo "----------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "📋 快速访问链接："
echo "----------------"
echo "🔗 后端API: http://localhost:3000"
echo "🔗 健康检查: http://localhost:3000/health"
echo "🔗 数据库管理: http://localhost:8080"
echo "   用户名: admin@example.com"
echo "   密码: admin123"

echo ""
echo "🛠️ 常用调试命令："
echo "----------------"
echo "查看后端日志: docker-compose logs -f backend"
echo "查看数据库日志: docker-compose logs -f postgres"
echo "进入后端容器: docker-compose exec backend sh"
echo "重启后端服务: docker-compose restart backend"
echo "停止所有服务: docker-compose down"

# 检查是否有错误的容器
echo ""
echo "⚠️  问题诊断："
echo "-------------"
FAILED_CONTAINERS=$(docker-compose ps --services --filter "status=exited")
if [ ! -z "$FAILED_CONTAINERS" ]; then
    echo "❌ 以下容器已停止："
    for container in $FAILED_CONTAINERS; do
        echo "   - $container"
        echo "     查看错误: docker-compose logs $container"
    done
else
    echo "✅ 所有容器运行正常"
fi