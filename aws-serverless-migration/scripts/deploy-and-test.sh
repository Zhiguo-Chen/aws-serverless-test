#!/bin/bash

# 部署和测试脚本
# 用于部署到 AWS 并验证连接

set -e

echo "🚀 开始部署 Serverless 应用..."

# 检查 AWS 凭据
echo "🔍 检查 AWS 凭据..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS 凭据未配置，请运行: aws configure"
    exit 1
fi

echo "✅ AWS 凭据验证成功"

# 检查 Serverless Framework
echo "🔍 检查 Serverless Framework..."
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework 未安装，请运行: npm install -g serverless"
    exit 1
fi

echo "✅ Serverless Framework 已安装"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 部署到开发环境
echo "🚀 部署到开发环境..."
serverless deploy --stage dev

# 获取 API Gateway URL
echo "🔍 获取 API 信息..."
API_INFO=$(serverless info --stage dev)
echo "$API_INFO"

# 提取 API Gateway URL
API_URL=$(echo "$API_INFO" | grep -o 'https://[^/]*\.execute-api\.[^/]*\.amazonaws\.com/dev' | head -1)

if [ -z "$API_URL" ]; then
    echo "⚠️  无法自动获取 API URL，请手动测试"
    echo "   运行: serverless info --stage dev"
    exit 0
fi

echo "🌐 API Gateway URL: $API_URL"

# 等待一下让 API Gateway 完全就绪
echo "⏳ 等待 API Gateway 就绪..."
sleep 10

# 测试健康检查端点
echo "🧪 测试健康检查端点..."
if curl -f -s "$API_URL/health" > /dev/null; then
    echo "✅ 健康检查端点正常"
else
    echo "⚠️  健康检查端点可能还未就绪，请稍后手动测试"
fi

# 测试产品 API
echo "🧪 测试产品 API..."
if curl -f -s "$API_URL/api/products" > /dev/null; then
    echo "✅ 产品 API 正常"
else
    echo "⚠️  产品 API 可能还未就绪或需要数据库初始化"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 测试命令:"
echo "   健康检查: curl $API_URL/health"
echo "   产品列表: curl $API_URL/api/products"
echo "   查看日志: serverless logs -f health --stage dev --tail"
echo ""
echo "🔍 如果遇到问题，请查看 CloudWatch 日志:"
echo "   AWS 控制台 → CloudWatch → Log groups → /aws/lambda/ecommerce-serverless-dev-*"