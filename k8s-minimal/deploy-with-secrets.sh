#!/bin/bash

# 安全部署脚本 - 从环境变量或文件读取密钥
set -e

echo "🔐 安全部署到 Kubernetes..."

# 检查必需的环境变量
required_vars=("OPENAI_API_KEY" "GOOGLE_API_KEY" "GEMINI_API_KEY" "XAI_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ 环境变量 $var 未设置"
        echo "请设置所有必需的 API 密钥环境变量"
        exit 1
    fi
done

echo "✅ 所有必需的环境变量已设置"

# 创建或更新 secret
echo "📝 更新 Kubernetes secrets..."
kubectl create secret generic backend-secret \
    --from-literal=JWT_SECRET="${JWT_SECRET:-test-jwt-secret}" \
    --from-literal=DB_PASSWORD="${DB_PASSWORD:-password123}" \
    --from-literal=MONGODB_URI="${MONGODB_URI:-mongodb://mongo-service/ecommerce}" \
    --from-literal=OPENAI_API_KEY="${OPENAI_API_KEY}" \
    --from-literal=GOOGLE_API_KEY="${GOOGLE_API_KEY}" \
    --from-literal=GEMINI_API_KEY="${GEMINI_API_KEY}" \
    --from-literal=XAI_API_KEY="${XAI_API_KEY}" \
    --namespace=ecommerce \
    --dry-run=client -o yaml | kubectl apply -f -

# 应用部署配置
echo "🚀 应用部署配置..."
kubectl apply -f deployment-minimal.yaml

echo "✅ 安全部署完成！"