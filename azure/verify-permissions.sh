#!/bin/bash

# 验证 GitHub Actions 服务主体权限
# 使用前请先登录 Azure CLI: az login

set -e

echo "🔍 验证 Azure 权限设置..."

# 配置变量 - 根据你的实际情况修改
RESOURCE_GROUP="E-commerce"
CLUSTER_NAME="ecommerce-test-aks"
ACR_NAME="ecommercetest2025"

# 获取当前订阅信息
echo "📋 当前订阅信息："
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
echo "订阅 ID: $SUBSCRIPTION_ID"
echo "订阅名称: $SUBSCRIPTION_NAME"
echo ""

# 检查资源是否存在
echo "🔍 检查资源是否存在..."

# 检查资源组
if az group show --name "$RESOURCE_GROUP" &>/dev/null; then
    echo "✅ 资源组 '$RESOURCE_GROUP' 存在"
else
    echo "❌ 资源组 '$RESOURCE_GROUP' 不存在"
    exit 1
fi

# 检查 AKS 集群
if az aks show --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME" &>/dev/null; then
    echo "✅ AKS 集群 '$CLUSTER_NAME' 存在"
    AKS_STATUS=$(az aks show --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME" --query "powerState.code" -o tsv)
    echo "   集群状态: $AKS_STATUS"
else
    echo "❌ AKS 集群 '$CLUSTER_NAME' 不存在"
    exit 1
fi

# 检查 ACR
if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    echo "✅ 容器注册表 '$ACR_NAME' 存在"
else
    echo "❌ 容器注册表 '$ACR_NAME' 不存在"
    exit 1
fi

echo ""

# 查找现有的服务主体
echo "🔍 查找 GitHub Actions 服务主体..."
echo "请输入你的服务主体应用名称（如：github-actions-sp 或 ecommerce-github-actions）："
read -r SP_NAME

if [ -z "$SP_NAME" ]; then
    echo "❌ 服务主体名称不能为空"
    exit 1
fi

# 获取服务主体信息
SP_INFO=$(az ad sp list --display-name "$SP_NAME" --query "[0].{appId:appId,objectId:objectId,displayName:displayName}" -o json)

if [ "$SP_INFO" = "null" ] || [ -z "$SP_INFO" ]; then
    echo "❌ 找不到名为 '$SP_NAME' 的服务主体"
    echo "💡 提示：检查 Azure Active Directory → 应用注册 中的应用名称"
    exit 1
fi

APP_ID=$(echo "$SP_INFO" | jq -r '.appId')
OBJECT_ID=$(echo "$SP_INFO" | jq -r '.objectId')
DISPLAY_NAME=$(echo "$SP_INFO" | jq -r '.displayName')

echo "✅ 找到服务主体："
echo "   名称: $DISPLAY_NAME"
echo "   应用 ID: $APP_ID"
echo "   对象 ID: $OBJECT_ID"
echo ""

# 检查当前权限
echo "🔍 检查当前权限分配..."

echo "📋 资源组权限："
RG_ROLES=$(az role assignment list --assignee "$APP_ID" --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" --query "[].{roleDefinitionName:roleDefinitionName,scope:scope}" -o table)
if [ -z "$RG_ROLES" ] || [ "$RG_ROLES" = "[]" ]; then
    echo "❌ 在资源组 '$RESOURCE_GROUP' 中没有权限"
else
    echo "$RG_ROLES"
fi

echo ""
echo "📋 AKS 集群权限："
AKS_ROLES=$(az role assignment list --assignee "$APP_ID" --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerService/managedClusters/$CLUSTER_NAME" --query "[].{roleDefinitionName:roleDefinitionName,scope:scope}" -o table)
if [ -z "$AKS_ROLES" ] || [ "$AKS_ROLES" = "[]" ]; then
    echo "❌ 在 AKS 集群 '$CLUSTER_NAME' 中没有权限"
else
    echo "$AKS_ROLES"
fi

echo ""
echo "📋 ACR 权限："
ACR_ROLES=$(az role assignment list --assignee "$APP_ID" --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME" --query "[].{roleDefinitionName:roleDefinitionName,scope:scope}" -o table)
if [ -z "$ACR_ROLES" ] || [ "$ACR_ROLES" = "[]" ]; then
    echo "❌ 在容器注册表 '$ACR_NAME' 中没有权限"
else
    echo "$ACR_ROLES"
fi

echo ""
echo "🔧 是否需要自动修复权限？(y/n)"
read -r FIX_PERMISSIONS

if [ "$FIX_PERMISSIONS" = "y" ] || [ "$FIX_PERMISSIONS" = "Y" ]; then
    echo "🛠️ 开始修复权限..."
    
    # 分配资源组权限
    echo "设置资源组权限..."
    az role assignment create \
        --assignee "$APP_ID" \
        --role "Contributor" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
        --output none 2>/dev/null || echo "   权限可能已存在"
    
    # 分配 AKS 权限
    echo "设置 AKS 权限..."
    az role assignment create \
        --assignee "$APP_ID" \
        --role "Azure Kubernetes Service Cluster User Role" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerService/managedClusters/$CLUSTER_NAME" \
        --output none 2>/dev/null || echo "   权限可能已存在"
    
    # 分配 ACR 权限
    echo "设置 ACR 推送权限..."
    az role assignment create \
        --assignee "$APP_ID" \
        --role "AcrPush" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME" \
        --output none 2>/dev/null || echo "   权限可能已存在"
    
    echo "设置 ACR 拉取权限..."
    az role assignment create \
        --assignee "$APP_ID" \
        --role "AcrPull" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME" \
        --output none 2>/dev/null || echo "   权限可能已存在"
    
    echo ""
    echo "✅ 权限修复完成！"
    echo ""
    echo "🔍 验证修复结果..."
    sleep 3
    
    # 重新检查权限
    echo "📋 更新后的权限："
    az role assignment list --assignee "$APP_ID" --query "[].{roleDefinitionName:roleDefinitionName,scope:scope}" -o table
fi

echo ""
echo "📝 下一步："
echo "1. 确保 GitHub Secrets 设置正确："
echo "   - AZURE_CREDENTIALS: 包含 clientId, clientSecret, subscriptionId, tenantId"
echo "2. 重新运行 GitHub Actions 工作流"
echo "3. 如果仍有问题，检查 Actions 日志中的具体错误"

echo ""
echo "🔗 有用的命令："
echo "# 查看所有权限分配"
echo "az role assignment list --assignee $APP_ID --output table"
echo ""
echo "# 测试 AKS 访问"
echo "az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME"
echo ""
echo "# 测试 ACR 访问"
echo "az acr login --name $ACR_NAME"