#!/bin/bash

# Azure资源创建脚本
set -e

# 配置变量 - 请根据你的需求修改
RESOURCE_GROUP="ecommerce-rg"
LOCATION="East Asia"  # 或者 "Southeast Asia"
ACR_NAME="ecommerceacr$(date +%s)"  # ACR名称必须全局唯一
AKS_CLUSTER_NAME="ecommerce-aks"
NODE_COUNT=2
VM_SIZE="Standard_B2s"  # 经济型实例

echo "开始创建Azure资源..."

# 1. 创建资源组
echo "创建资源组: $RESOURCE_GROUP"
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# 2. 创建Azure Container Registry (ACR)
echo "创建容器注册表: $ACR_NAME"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# 3. 创建AKS集群
echo "创建AKS集群: $AKS_CLUSTER_NAME"
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER_NAME \
  --node-count $NODE_COUNT \
  --node-vm-size $VM_SIZE \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr $ACR_NAME

# 4. 获取AKS凭据
echo "配置kubectl..."
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME

# 5. 安装NGINX Ingress Controller
echo "安装NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# 6. 获取ACR登录信息
echo "获取ACR登录信息..."
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "passwords[0].value" --output tsv)

echo ""
echo "=== Azure资源创建完成 ==="
echo "资源组: $RESOURCE_GROUP"
echo "ACR名称: $ACR_NAME"
echo "ACR登录服务器: $ACR_LOGIN_SERVER"
echo "AKS集群: $AKS_CLUSTER_NAME"
echo ""
echo "=== GitHub Secrets配置 ==="
echo "请在GitHub仓库的Settings > Secrets中添加以下secrets:"
echo ""
echo "ACR_USERNAME: $ACR_USERNAME"
echo "ACR_PASSWORD: $ACR_PASSWORD"
echo ""
echo "AZURE_CREDENTIALS: (需要创建Service Principal)"
echo "运行以下命令获取AZURE_CREDENTIALS:"
echo "az ad sp create-for-rbac --name \"ecommerce-github-actions\" --role contributor --scopes /subscriptions/\$(az account show --query id --output tsv)/resourceGroups/$RESOURCE_GROUP --sdk-auth"
echo ""
echo "=== 更新GitHub Actions配置 ==="
echo "请更新 .github/workflows/deploy-backend.yml 中的以下变量:"
echo "AZURE_CONTAINER_REGISTRY: $ACR_NAME"
echo "RESOURCE_GROUP: $RESOURCE_GROUP"
echo "CLUSTER_NAME: $AKS_CLUSTER_NAME"