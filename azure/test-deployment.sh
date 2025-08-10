#!/bin/bash

# 测试部署权限 - 模拟 GitHub Actions 的操作
# 使用前请先运行: az login

set -e

echo "🧪 测试 GitHub Actions 部署权限..."

# 配置变量
RESOURCE_GROUP="E-commerce"
CLUSTER_NAME="ecommerce-test-aks"
ACR_NAME="ecommercetest2025"

echo "📋 测试配置："
echo "资源组: $RESOURCE_GROUP"
echo "AKS 集群: $CLUSTER_NAME"
echo "容器注册表: $ACR_NAME"
echo ""

# 测试 1: 检查 AKS 集群状态
echo "🔍 测试 1: 检查 AKS 集群状态..."
if STATUS=$(az aks show --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME" --query "powerState.code" --output tsv 2>/dev/null); then
    echo "✅ 成功读取 AKS 集群状态: $STATUS"
    
    if [ "$STATUS" != "Running" ]; then
        echo "⚠️  集群当前未运行，GitHub Actions 会尝试启动它"
        echo "💡 如果需要，可以手动启动: az aks start --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME"
    fi
else
    echo "❌ 无法读取 AKS 集群状态 - 权限不足"
    echo "需要 'Azure Kubernetes Service Cluster User Role' 权限"
fi

echo ""

# 测试 2: 测试 ACR 登录
echo "🔍 测试 2: 测试 ACR 登录..."
if az acr login --name "$ACR_NAME" 2>/dev/null; then
    echo "✅ 成功登录到容器注册表"
else
    echo "❌ 无法登录到容器注册表 - 权限不足"
    echo "需要 'AcrPush' 和 'AcrPull' 权限"
fi

echo ""

# 测试 3: 获取 AKS 凭据
echo "🔍 测试 3: 获取 AKS 凭据..."
if az aks get-credentials --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME" --overwrite-existing 2>/dev/null; then
    echo "✅ 成功获取 AKS 凭据"
    
    # 测试 kubectl 连接
    if kubectl cluster-info 2>/dev/null | head -1; then
        echo "✅ kubectl 连接正常"
    else
        echo "⚠️  kubectl 连接可能有问题，但凭据获取成功"
    fi
else
    echo "❌ 无法获取 AKS 凭据 - 权限不足"
fi

echo ""

# 测试 4: 检查命名空间
echo "🔍 测试 4: 检查 Kubernetes 命名空间..."
if kubectl get namespace ecommerce 2>/dev/null; then
    echo "✅ 命名空间 'ecommerce' 存在"
else
    echo "⚠️  命名空间 'ecommerce' 不存在，GitHub Actions 会创建它"
    echo "💡 可以手动创建: kubectl create namespace ecommerce"
fi

echo ""

# 测试 5: 模拟镜像推送测试
echo "🔍 测试 5: 检查 ACR 推送权限..."
if az acr repository list --name "$ACR_NAME" 2>/dev/null >/dev/null; then
    echo "✅ 有权限访问 ACR 仓库列表"
    
    # 显示现有镜像
    REPOS=$(az acr repository list --name "$ACR_NAME" --output tsv 2>/dev/null)
    if [ -n "$REPOS" ]; then
        echo "📦 现有镜像仓库:"
        echo "$REPOS" | sed 's/^/   - /'
    else
        echo "📦 暂无镜像仓库"
    fi
else
    echo "❌ 无权限访问 ACR 仓库"
fi

echo ""
echo "📊 测试总结："

# 汇总测试结果
TESTS_PASSED=0
TOTAL_TESTS=5

# 重新运行关键测试并计数
if az aks show --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME" --query "powerState.code" --output tsv &>/dev/null; then
    ((TESTS_PASSED++))
    echo "✅ AKS 集群访问"
else
    echo "❌ AKS 集群访问"
fi

if az acr login --name "$ACR_NAME" &>/dev/null; then
    ((TESTS_PASSED++))
    echo "✅ ACR 登录"
else
    echo "❌ ACR 登录"
fi

if az aks get-credentials --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME" --overwrite-existing &>/dev/null; then
    ((TESTS_PASSED++))
    echo "✅ AKS 凭据获取"
else
    echo "❌ AKS 凭据获取"
fi

if kubectl cluster-info &>/dev/null; then
    ((TESTS_PASSED++))
    echo "✅ Kubernetes 连接"
else
    echo "❌ Kubernetes 连接"
fi

if az acr repository list --name "$ACR_NAME" &>/dev/null; then
    ((TESTS_PASSED++))
    echo "✅ ACR 仓库访问"
else
    echo "❌ ACR 仓库访问"
fi

echo ""
echo "🎯 测试结果: $TESTS_PASSED/$TOTAL_TESTS 通过"

if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
    echo "🎉 所有测试通过！GitHub Actions 应该可以正常部署"
elif [ $TESTS_PASSED -ge 3 ]; then
    echo "⚠️  大部分测试通过，GitHub Actions 可能可以部署，但建议修复失败的测试"
else
    echo "❌ 多个测试失败，需要修复权限问题"
    echo ""
    echo "🔧 建议运行权限修复脚本:"
    echo "bash azure/verify-permissions.sh"
fi

echo ""
echo "📝 如果测试通过，可以尝试推送代码触发 GitHub Actions 部署"