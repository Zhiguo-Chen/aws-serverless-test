# Azure AKS 部署指南

## 部署架构

```
GitHub Repository
    ↓ (push代码)
GitHub Actions
    ↓ (构建镜像)
Azure Container Registry (ACR)
    ↓ (部署到)
Azure Kubernetes Service (AKS)
```

## 部署步骤

### 1. 安装 Azure CLI

```bash
# macOS
brew install azure-cli

# 登录Azure
az login
```

### 2. 创建 Azure 资源

```bash
chmod +x azure/setup-azure-resources.sh
./azure/setup-azure-resources.sh
```

这个脚本会创建：

- 资源组 (Resource Group)
- Azure 容器注册表 (ACR)
- AKS 集群
- NGINX Ingress Controller

### 3. 配置 GitHub Secrets

在 GitHub 仓库的 `Settings > Secrets and variables > Actions` 中添加：

**必需的 Secrets:**

- `AZURE_CREDENTIALS`: Azure 服务主体凭据
- `ACR_USERNAME`: ACR 用户名
- `ACR_PASSWORD`: ACR 密码

**获取 AZURE_CREDENTIALS:**

```bash
az ad sp create-for-rbac --name "ecommerce-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id --output tsv)/resourceGroups/your-resource-group \
  --sdk-auth
```

### 4. 更新配置文件

**更新 `.github/workflows/deploy-backend.yml`:**

```yaml
env:
  AZURE_CONTAINER_REGISTRY: your-acr-name # 从脚本输出获取
  RESOURCE_GROUP: your-resource-group # 从脚本输出获取
  CLUSTER_NAME: your-aks-cluster # 从脚本输出获取
```

**更新 `k8s/secret.yaml`:**

```bash
cd k8s
./update-secrets.sh  # 输入实际的密钥值
```

### 5. 部署应用

推送代码到 GitHub，GitHub Actions 会自动：

1. 构建 Docker 镜像
2. 推送到 ACR
3. 部署到 AKS

```bash
git add .
git commit -m "Add K8s deployment configuration"
git push origin main
```

## 验证部署

### 查看 GitHub Actions 状态

在 GitHub 仓库的 `Actions` 标签页查看部署状态

### 连接到 AKS 集群

```bash
az aks get-credentials --resource-group your-resource-group --name your-aks-cluster
```

### 查看部署状态

```bash
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
kubectl get ingress -n ecommerce
```

### 获取外部访问地址

```bash
# 获取LoadBalancer外部IP
kubectl get service backend-service-external -n ecommerce

# 或者获取Ingress IP
kubectl get ingress backend-ingress -n ecommerce
```

## 成本优化建议

### 1. 使用 Spot 实例

```bash
az aks nodepool add \
  --resource-group your-resource-group \
  --cluster-name your-aks-cluster \
  --name spotpool \
  --priority Spot \
  --eviction-policy Delete \
  --spot-max-price -1 \
  --enable-cluster-autoscaler \
  --min-count 1 \
  --max-count 3 \
  --node-vm-size Standard_B2s
```

### 2. 启用集群自动缩放

```bash
az aks update \
  --resource-group your-resource-group \
  --name your-aks-cluster \
  --enable-cluster-autoscaler \
  --min-count 1 \
  --max-count 5
```

### 3. 使用 Azure Dev/Test 定价

如果是开发环境，可以申请 Azure Dev/Test 订阅获得折扣。

## 监控和日志

### 查看应用日志

```bash
kubectl logs -f deployment/backend-deployment -n ecommerce
```

### Azure Monitor 集成

AKS 集群已启用 Azure Monitor，可以在 Azure 门户查看：

- 容器洞察
- 性能指标
- 日志分析

## 故障排查

### 常见问题

1. **镜像拉取失败**: 检查 ACR 权限配置
2. **Pod 启动失败**: 检查 Secret 配置和环境变量
3. **服务无法访问**: 检查 Service 和 Ingress 配置

### 调试命令

```bash
# 查看Pod详情
kubectl describe pod <pod-name> -n ecommerce

# 查看事件
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# 进入Pod调试
kubectl exec -it <pod-name> -n ecommerce -- /bin/sh
```
