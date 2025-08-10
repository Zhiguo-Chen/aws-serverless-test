#!/bin/bash

# Azure最小成本K8s资源创建脚本
set -e

echo "🏗️  创建Azure最小成本测试环境..."

# 配置变量
RESOURCE_GROUP="ecommerce-test-rg"
LOCATION="East Asia"  # 选择最便宜的区域
AKS_CLUSTER_NAME="ecommerce-test-aks"
ACR_NAME="ecommercetest$(date +%s)"
NODE_COUNT=1
VM_SIZE="Standard_B1s"  # 最小规格：1核1GB

echo "📋 配置信息："
echo "   资源组: $RESOURCE_GROUP"
echo "   位置: $LOCATION"
echo "   AKS集群: $AKS_CLUSTER_NAME"
echo "   ACR: $ACR_NAME"
echo "   节点规格: $VM_SIZE (1核1GB)"
echo "   节点数量: $NODE_COUNT"
echo ""

# 1. 创建资源组
echo "1️⃣  创建资源组..."
az group create \
  --name $RESOURCE_GROUP \
  --location "$LOCATION" \
  --tags Environment=Test Project=E-Commerce AutoDelete=30days

# 2. 创建ACR（基本版，最便宜）
echo "2️⃣  创建容器注册表（基本版）..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true \
  --tags Environment=Test

# 3. 创建最小规格AKS集群
echo "3️⃣  创建AKS集群（最小配置）..."
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER_NAME \
  --node-count $NODE_COUNT \
  --node-vm-size $VM_SIZE \
  --node-osdisk-size 30 \
  --node-osdisk-type Standard_LRS \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku basic \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr $ACR_NAME \
  --tier Free \
  --tags Environment=Test Project=E-Commerce

# 4. 获取AKS凭据
echo "4️⃣  配置kubectl..."
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER_NAME \
  --overwrite-existing

# 5. 创建命名空间
echo "5️⃣  创建Kubernetes命名空间..."
kubectl create namespace ecommerce --dry-run=client -o yaml | kubectl apply -f -

# 6. 获取ACR登录信息
echo "6️⃣  获取ACR登录信息..."
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "passwords[0].value" --output tsv)

# 7. 创建成本优化的节点池（Spot实例）
echo "7️⃣  添加Spot实例节点池（可选）..."
az aks nodepool add \
  --resource-group $RESOURCE_GROUP \
  --cluster-name $AKS_CLUSTER_NAME \
  --name spotpool \
  --priority Spot \
  --eviction-policy Delete \
  --spot-max-price -1 \
  --enable-cluster-autoscaler \
  --min-count 0 \
  --max-count 2 \
  --node-count 0 \
  --node-vm-size Standard_B1s \
  --node-osdisk-size 30 \
  --tags Environment=Test || echo "⚠️  Spot节点池创建失败，继续使用常规节点池"

# 8. 设置预算警报
echo "8️⃣  设置成本警报..."
SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# 创建预算（需要Billing权限）
az consumption budget create \
  --budget-name "ecommerce-test-budget" \
  --amount 20 \
  --time-grain Monthly \
  --start-date $(date -d "first day of this month" +%Y-%m-01) \
  --end-date $(date -d "first day of next month + 1 year" +%Y-%m-01) \
  --resource-group $RESOURCE_GROUP \
  --threshold 80 \
  --threshold 100 || echo "⚠️  预算创建失败，请手动在Azure门户设置"

echo ""
echo "✅ 最小成本Azure环境创建完成！"
echo ""
echo "📊 预估月费用："
echo "   AKS控制平面: 免费"
echo "   1个B1s节点: ~$8/月"
echo "   ACR基本版: ~$5/月"
echo "   网络流量: ~$1/月"
echo "   总计: ~$14/月"
echo ""
echo "🔑 ACR信息："
echo "   登录服务器: $ACR_LOGIN_SERVER"
echo "   用户名: $ACR_USERNAME"
echo "   密码: $ACR_PASSWORD"
echo ""
echo "📋 GitHub Secrets配置："
echo "   AZURE_CONTAINER_REGISTRY: $ACR_NAME"
echo "   RESOURCE_GROUP: $RESOURCE_GROUP"
echo "   CLUSTER_NAME: $AKS_CLUSTER_NAME"
echo "   ACR_USERNAME: $ACR_USERNAME"
echo "   ACR_PASSWORD: $ACR_PASSWORD"
echo ""
echo "💡 节省成本的建议："
echo "   1. 设置自动关机：./setup-auto-shutdown.sh"
echo "   2. 监控成本：az consumption usage list"
echo "   3. 不用时停止集群：az aks stop --name $AKS_CLUSTER_NAME --resource-group $RESOURCE_GROUP"
echo "   4. 重启集群：az aks start --name $AKS_CLUSTER_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "🎯 下一步："
echo "   1. 更新GitHub Actions配置"
echo "   2. 推送代码触发部署"
echo "   3. 设置自动关机策略"