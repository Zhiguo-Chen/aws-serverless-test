#!/bin/bash

echo "🔧 Docker问题修复脚本"

# 停止所有容器
echo "1. 停止现有容器..."
docker-compose down

# 清理Docker缓存
echo "2. 清理Docker缓存..."
docker system prune -f

# 删除旧镜像
echo "3. 删除旧的后端镜像..."
docker rmi $(docker images | grep backend | awk '{print $3}') 2>/dev/null || true

# 重新构建
echo "4. 重新构建镜像..."
docker-compose build --no-cache backend

# 启动服务
echo "5. 启动服务..."
docker-compose up -d

echo "✅ 修复完成！"
echo ""
echo "检查服务状态:"
docker-compose ps

echo ""
echo "如果还有问题，查看日志:"
echo "docker-compose logs backend"