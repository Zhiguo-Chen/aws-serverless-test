#!/bin/bash

echo "🐳 启动E-Commerce后端服务..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker Desktop"
    exit 1
fi

# 检查是否在backend目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在backend目录下运行此脚本"
    exit 1
fi

echo "📦 启动服务容器..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 15

echo "🔍 运行服务状态检查..."
./check-services.sh