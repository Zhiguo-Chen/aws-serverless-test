#!/bin/bash

echo "🧪 测试后端API接口..."
echo "===================="

BASE_URL="http://localhost:3000"

# 测试健康检查
echo "1. 健康检查测试："
echo "GET $BASE_URL/health"
curl -s -w "\n状态码: %{http_code}\n响应时间: %{time_total}s\n" $BASE_URL/health
echo ""

# 测试API根路径
echo "2. API根路径测试："
echo "GET $BASE_URL/api"
curl -s -w "\n状态码: %{http_code}\n" $BASE_URL/api
echo ""

# 测试不存在的路径（应该返回404）
echo "3. 404错误测试："
echo "GET $BASE_URL/nonexistent"
curl -s -w "\n状态码: %{http_code}\n" $BASE_URL/nonexistent
echo ""

# 如果有具体的API端点，可以添加更多测试
echo "4. 可能的API端点测试："
endpoints=("/api/products" "/api/users" "/api/categories" "/api/auth")

for endpoint in "${endpoints[@]}"; do
    echo "GET $BASE_URL$endpoint"
    response=$(curl -s -w "%{http_code}" $BASE_URL$endpoint)
    status_code="${response: -3}"
    if [ "$status_code" = "200" ] || [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
        echo "✅ 端点存在 (状态码: $status_code)"
    else
        echo "❓ 端点可能不存在或有问题 (状态码: $status_code)"
    fi
    echo ""
done

echo "🔍 如果看到连接错误，请检查："
echo "1. 容器是否正在运行: docker-compose ps"
echo "2. 后端日志: docker-compose logs backend"
echo "3. 端口是否被占用: lsof -i :3000"