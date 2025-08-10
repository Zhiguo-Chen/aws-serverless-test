#!/bin/bash

# 测试 Kubernetes 部署配置
set -e

echo "🧪 测试 Kubernetes 部署配置..."

# 检查 kubectl 连接
if ! kubectl cluster-info &>/dev/null; then
    echo "❌ kubectl 未连接到集群"
    exit 1
fi

echo "✅ kubectl 连接正常"

# 应用配置
echo "📦 应用部署配置..."
kubectl apply -f deployment-minimal.yaml

echo "⏳ 等待 Pod 启动..."
sleep 10

# 检查命名空间
echo "🔍 检查命名空间..."
kubectl get namespace ecommerce

# 检查 Pod 状态
echo "📊 检查 Pod 状态..."
kubectl get pods -n ecommerce

# 检查服务状态
echo "🌐 检查服务状态..."
kubectl get services -n ecommerce

# 检查部署状态
echo "🚀 检查部署状态..."
kubectl get deployments -n ecommerce

# 查看有问题的 Pod 详情
echo "🔍 检查 Pod 详情..."
FAILED_PODS=$(kubectl get pods -n ecommerce --field-selector=status.phase!=Running -o name 2>/dev/null || echo "")

if [ -n "$FAILED_PODS" ]; then
    echo "⚠️  发现有问题的 Pod："
    echo "$FAILED_PODS"
    
    for pod in $FAILED_PODS; do
        echo "📋 $pod 详情："
        kubectl describe $pod -n ecommerce
        echo "📋 $pod 日志："
        kubectl logs $pod -n ecommerce --tail=20 || echo "无日志"
        echo "---"
    done
else
    echo "✅ 所有 Pod 运行正常"
fi

echo "🎯 测试完成！"