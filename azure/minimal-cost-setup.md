# Azure K8s 最低成本测试配置

## 💰 目标：月费用控制在 $10-15

### 🎯 测试环境策略

- 使用最小规格的虚拟机
- 启用自动关机
- 使用 Spot 实例
- 共享数据库服务
- 最小化网络流量

## 📋 超低成本配置清单

### 1. AKS 集群配置

```bash
# 最小规格配置
VM规格: Standard_B1s (1核1GB)
节点数量: 1个节点
磁盘: 标准SSD 30GB
网络: 基础网络
```

### 2. 数据库策略

**选项 A: 使用 Azure Database for PostgreSQL - 灵活服务器**

- 规格: Burstable B1ms (1 核 2GB)
- 存储: 32GB
- 备份: 7 天本地备份
- 月费用: ~$12

**选项 B: 在 K8s 中运行数据库（更便宜）**

- PostgreSQL 和 MongoDB 都在 Pod 中运行
- 使用持久卷存储数据
- 月费用: ~$0（包含在 VM 费用中）

### 3. 容器注册表

- Azure Container Registry: 基本版 ~$5/月
- 或使用 Docker Hub 免费版

## 🛠️ 具体实施方案

### 方案 1: 极简 K8s 配置（推荐）

**月费用: $8-12**

```
- AKS控制平面: 免费
- 1个B1s节点: ~$8/月
- ACR基本版: ~$5/月
- 网络流量: ~$1/月
```

### 方案 2: 使用 Azure 容器实例

**月费用: $5-8**

```
- Azure Container Instances
- 按使用时间计费
- 测试时启动，不用时关闭
```

### 方案 3: 使用 Azure App Service

**月费用: $0-13**

```
- App Service免费层: $0
- 或基本B1: ~$13/月
- 包含数据库连接
```

## 🚀 推荐配置：极简 K8s

### 创建资源脚本

```bash
#!/bin/bash

RESOURCE_GROUP="ecommerce-test-rg"
LOCATION="East Asia"
AKS_CLUSTER_NAME="ecommerce-test-aks"
ACR_NAME="ecommercetest$(date +%s)"

# 创建资源组
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# 创建ACR（基本版）
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# 创建最小规格AKS集群
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER_NAME \
  --node-count 1 \
  --node-vm-size Standard_B1s \
  --node-osdisk-size 30 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr $ACR_NAME \
  --tier Free
```

## 📦 最小化 K8s 配置

### 1. 简化的 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  namespace: ecommerce
spec:
  replicas: 1 # 只运行1个实例
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: your-acr.azurecr.io/ecommerce-backend:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: '128Mi' # 最小内存
              cpu: '100m' # 最小CPU
            limits:
              memory: '256Mi'
              cpu: '200m'
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DB_HOST
              value: 'postgres-service'
          # ... 其他环境变量
```

### 2. 数据库 Pod 配置

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
  namespace: ecommerce
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          resources:
            requests:
              memory: '64Mi'
              cpu: '50m'
            limits:
              memory: '128Mi'
              cpu: '100m'
          env:
            - name: POSTGRES_DB
              value: 'E-Commerce'
            - name: POSTGRES_USER
              value: 'postgres'
            - name: POSTGRES_PASSWORD
              value: 'password123'
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          emptyDir: {} # 测试用，重启会丢失数据
```

## ⏰ 自动关机策略

### 1. 定时关机脚本

```bash
#!/bin/bash
# 每天晚上10点关机，早上8点开机

# 关机
az aks stop --name ecommerce-test-aks --resource-group ecommerce-test-rg

# 开机
az aks start --name ecommerce-test-aks --resource-group ecommerce-test-rg
```

### 2. 使用 Azure 自动化

- 创建自动化账户
- 设置定时任务
- 工作日 8:00 开机，18:00 关机
- 周末完全关闭

## 💡 进一步节省成本的技巧

### 1. 使用 Azure 学生订阅

- 每月$100 免费额度
- 免费 12 个月

### 2. 使用 Azure 免费试用

- 新用户$200 免费额度
- 30 天试用期

### 3. 资源标记和监控

```bash
# 添加自动删除标记
az resource tag --tags Environment=Test AutoDelete=30days \
  --resource-group ecommerce-test-rg
```

### 4. 使用开发/测试定价

- 申请开发/测试订阅
- 可节省 40-60%成本

## 📊 成本对比

### 传统配置 vs 测试配置

```
传统配置:
- 3个Standard_B2s节点: $90/月
- Azure Database: $50/月
- 网络和存储: $20/月
- 总计: $160/月

测试配置:
- 1个Standard_B1s节点: $8/月
- Pod内数据库: $0
- ACR基本版: $5/月
- 网络流量: $1/月
- 总计: $14/月

节省: 90%+ 💰
```

## ⚠️ 测试配置限制

### 性能限制

- 单节点，无高可用
- 内存和 CPU 受限
- 数据库性能较低

### 数据安全

- 使用 emptyDir 存储，重启丢失数据
- 无自动备份
- 不适合生产数据

### 网络限制

- 基础网络配置
- 无 CDN 加速
- 有流量限制

## 🎯 实施步骤

### 1. 创建最小资源

```bash
# 运行创建脚本
./create-minimal-azure-resources.sh
```

### 2. 部署应用

```bash
# 使用最小配置部署
kubectl apply -f k8s-minimal/
```

### 3. 设置自动关机

```bash
# 配置定时任务
crontab -e
# 添加：0 22 * * * /path/to/shutdown-aks.sh
# 添加：0 8 * * 1-5 /path/to/startup-aks.sh
```

### 4. 监控成本

- 设置预算警报: $15/月
- 每周检查成本报告
- 及时清理不用的资源

这样配置下来，你的月费用可以控制在$10-15，非常适合测试和学习 K8s！
