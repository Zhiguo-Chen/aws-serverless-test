#!/bin/bash

# Fix Azure permissions for GitHub Actions deployment
# Run this script after setting the variables below

set -e

# Configuration - UPDATE THESE VALUES
SUBSCRIPTION_ID="your-subscription-id"
RESOURCE_GROUP="E-commerce"
ACR_NAME="ecommercetest2025"
CLUSTER_NAME="ecommerce-test-aks"
SERVICE_PRINCIPAL_NAME="github-actions-sp"

echo "🔧 Fixing Azure permissions for GitHub Actions..."

# Get service principal info
echo "📋 Getting service principal information..."
SP_INFO=$(az ad sp list --display-name "$SERVICE_PRINCIPAL_NAME" --query "[0].{appId:appId,objectId:objectId}" --output json)

if [ "$SP_INFO" = "null" ]; then
    echo "❌ Service principal '$SERVICE_PRINCIPAL_NAME' not found!"
    echo "Creating new service principal..."
    
    SP_INFO=$(az ad sp create-for-rbac --name "$SERVICE_PRINCIPAL_NAME" --role contributor --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" --sdk-auth)
    echo "✅ Service principal created. Save this output as AZURE_CREDENTIALS secret:"
    echo "$SP_INFO"
    
    APP_ID=$(echo $SP_INFO | jq -r '.clientId')
else
    APP_ID=$(echo $SP_INFO | jq -r '.appId')
    echo "✅ Found service principal: $APP_ID"
fi

echo "🔑 Assigning permissions..."

# AKS permissions
echo "Setting up AKS permissions..."
az role assignment create \
  --assignee "$APP_ID" \
  --role "Azure Kubernetes Service Cluster User Role" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerService/managedClusters/$CLUSTER_NAME" \
  --output none || echo "Role may already exist"

# ACR permissions
echo "Setting up ACR permissions..."
az role assignment create \
  --assignee "$APP_ID" \
  --role "AcrPush" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME" \
  --output none || echo "Role may already exist"

az role assignment create \
  --assignee "$APP_ID" \
  --role "AcrPull" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME" \
  --output none || echo "Role may already exist"

# Resource group permissions
echo "Setting up resource group permissions..."
az role assignment create \
  --assignee "$APP_ID" \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  --output none || echo "Role may already exist"

echo "✅ Permissions setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your GitHub secrets are set:"
echo "   - AZURE_CREDENTIALS (service principal JSON)"
echo "2. Remove ACR_USERNAME and ACR_PASSWORD secrets (no longer needed)"
echo "3. Re-run your GitHub Actions workflow"
echo ""
echo "🔍 To verify permissions:"
echo "az role assignment list --assignee $APP_ID --output table"