# Azure 门户部署指南

## 🚨 修复 GitHub Actions 权限问题

如果你遇到类似这样的错误：

```
ERROR: (AuthorizationFailed) The client does not have authorization to perform action 'Microsoft.ContainerService/managedClusters/read'
```

### 通过 Azure 门户修复权限

#### 步骤 1：找到你的服务主体

1. 登录 [Azure 门户](https://portal.azure.com)
2. 搜索并进入 **"Azure Active Directory"**
3. 左侧菜单点击 **"应用注册"**
4. 找到你为 GitHub Actions 创建的应用（如 `ecommerce-github-actions`）

#### 步骤 2：为 AKS 集群分配权限

1. 搜索并进入你的 **AKS 集群** (`ecommerce-test-aks`)
2. 左侧菜单点击 **"访问控制 (IAM)"**
3. 点击 **"+ 添加"** → **"添加角色分配"**
4. 在 **"角色"** 标签页：
   - 搜索并选择 **"Azure Kubernetes Service Cluster User Role"**
   - 点击 **"下一步"**
5. 在 **"成员"** 标签页：
   - 选择 **"用户、组或服务主体"**
   - 点击 **"+ 选择成员"**
   - 搜索你的应用名称（如 `ecommerce-github-actions`）
   - 选择并点击 **"选择"**
6. 点击 **"查看 + 分配"** → **"分配"**

#### 步骤 3：为 ACR 分配权限

1. 搜索并进入你的 **容器注册表** (`ecommercetest2025`)
2. 左侧菜单点击 **"访问控制 (IAM)"**
3. 重复上面的步骤，但这次分配以下角色：
   - **"AcrPush"** 角色（用于推送镜像）
   - **"AcrPull"** 角色（用于拉取镜像）

#### 步骤 4：为资源组分配权限

1. 进入你的资源组 **"E-commerce"**
2. 左侧菜单点击 **"访问控制 (IAM)"**
3. 添加角色分配：
   - 角色：**"Contributor"**
   - 成员：你的服务主体应用

#### 步骤 5：验证权限

1. 在资源组的 **"访问控制 (IAM)"** 页面
2. 点击 **"角色分配"** 标签页
3. 确认你的服务主体有以下权限：
   - 资源组级别：`Contributor`
   - AKS 级别：`Azure Kubernetes Service Cluster User Role`
   - ACR 级别：`AcrPush` 和 `AcrPull`

### 简化方案：使用 Azure CLI 登录

如果权限设置太复杂，你也可以修改 GitHub Actions 工作流使用更简单的认证方式。我已经更新了你的工作流文件，移除了 ACR 用户名/密码认证，改用 Azure CLI 直接登录。

---

## 概述

通过 Azure 门户界面创建 AKS 集群和容器注册表，然后使用 GitHub Actions 自动部署。

## 第一步：创建资源组

1. 登录 [Azure 门户](https://portal.azure.com)
2. 点击左侧菜单的 **"资源组"**
3. 点击 **"+ 创建"**
4. 填写信息：
   - **订阅**: 选择你的订阅
   - **资源组名称**: `ecommerce-rg`
   - **区域**: `East Asia` 或 `Southeast Asia`
5. 点击 **"查看 + 创建"** → **"创建"**

## 第二步：创建容器注册表 (ACR)

1. 在 Azure 门户搜索框输入 **"容器注册表"**
2. 点击 **"+ 创建"**
3. 填写基本信息：
   - **订阅**: 选择你的订阅
   - **资源组**: 选择刚创建的 `ecommerce-rg`
   - **注册表名称**: `ecommerceacr[随机数字]` (必须全局唯一)
   - **位置**: 与资源组相同
   - **SKU**: `基本` (最经济)
4. 点击 **"查看 + 创建"** → **"创建"**

### 启用管理员用户

1. 创建完成后，进入 ACR 资源
2. 左侧菜单点击 **"访问密钥"**
3. 启用 **"管理员用户"**
4. **记录下用户名和密码**（稍后 GitHub 需要用到）

## 第三步：创建 AKS 集群

1. 在 Azure 门户搜索框输入 **"Kubernetes 服务"**
2. 点击 **"+ 创建"** → **"创建 Kubernetes 集群"**

### 基本信息标签页

- **订阅**: 选择你的订阅
- **资源组**: 选择 `ecommerce-rg`
- **集群名称**: `ecommerce-aks`
- **区域**: 与资源组相同
- **可用性区域**: 无
- **AKS 定价层**: `免费`
- **Kubernetes 版本**: 使用默认版本

### 主节点池标签页

- **节点大小**: `Standard_B2s` (2 核 4GB，经济型)
- **缩放方法**: `手动`
- **节点计数**: `2`

### 身份验证标签页

- **身份验证和授权**: `本地帐户与 Kubernetes RBAC`
- **服务主体**: `系统分配的托管标识`

### 网络标签页

- **网络配置**: `kubenet`
- **DNS 名称前缀**: 使用默认值

### 集成标签页

- **容器注册表**: 选择刚创建的 ACR
- **启用容器见解**: ✅ 勾选
- **Log Analytics 工作区**: 创建新的

### 高级标签页

- 保持默认设置

### 标记标签页

- 可选添加标记，如：
  - `Environment`: `Production`
  - `Project`: `E-Commerce`

3. 点击 **"查看 + 创建"** → **"创建"**

   ⏰ **创建时间约 10-15 分钟**

## 第四步：安装 NGINX Ingress Controller

1. AKS 创建完成后，进入 AKS 资源
2. 左侧菜单点击 **"扩展 + 应用程序"**
3. 点击 **"+ 添加"**
4. 搜索 **"NGINX"**
5. 选择 **"NGINX Ingress Controller"**
6. 点击 **"创建"**
7. 使用默认配置，点击 **"创建"**

## 第五步：创建服务主体（用于 GitHub Actions）

1. 在 Azure 门户搜索 **"Azure Active Directory"**
2. 左侧菜单点击 **"应用注册"**
3. 点击 **"+ 新注册"**
4. 填写信息：
   - **名称**: `ecommerce-github-actions`
   - **支持的帐户类型**: `仅此组织目录中的帐户`
5. 点击 **"注册"**

### 创建客户端密码

1. 在应用注册页面，左侧点击 **"证书和密码"**
2. 点击 **"+ 新客户端密码"**
3. **说明**: `GitHub Actions`
4. **过期时间**: `24个月`
5. 点击 **"添加"**
6. **立即复制密码值**（只显示一次）

### 分配权限

1. 回到资源组 `ecommerce-rg`
2. 左侧点击 **"访问控制 (IAM)"**
3. 点击 **"+ 添加"** → **"添加角色分配"**
4. **角色**: `参与者`
5. **分配访问权限给**: `用户、组或服务主体`
6. 搜索并选择 `ecommerce-github-actions`
7. 点击 **"保存"**

## 第六步：获取必要信息

### 获取订阅 ID

1. 在 Azure 门户搜索 **"订阅"**
2. 点击你的订阅
3. 复制 **"订阅 ID"**

### 获取租户 ID

1. 在 Azure 门户搜索 **"Azure Active Directory"**
2. 在概述页面复制 **"租户 ID"**

### 获取应用程序 ID

1. 回到之前创建的应用注册 `ecommerce-github-actions`
2. 在概述页面复制 **"应用程序(客户端)ID"**

## 第七步：配置 GitHub Secrets

在你的 GitHub 仓库中，进入 `Settings` → `Secrets and variables` → `Actions`，添加以下 secrets：

### AZURE_CREDENTIALS

创建 JSON 格式的凭据：

```json
{
  "clientId": "你的应用程序ID",
  "clientSecret": "你的客户端密码",
  "subscriptionId": "你的订阅ID",
  "tenantId": "你的租户ID"
}
```

### ACR_USERNAME

从 ACR 的"访问密钥"页面获取的用户名

### ACR_PASSWORD

从 ACR 的"访问密钥"页面获取的密码

## 第八步：更新配置文件

### 更新 GitHub Actions 工作流

编辑 `.github/workflows/deploy-backend.yml`：

```yaml
env:
  AZURE_CONTAINER_REGISTRY: 你的ACR名称 # 例如：ecommerceacr123456
  RESOURCE_GROUP: ecommerce-rg
  CLUSTER_NAME: ecommerce-aks
```

### 更新应用密钥

运行脚本更新 K8s secrets：

```bash
cd k8s
./update-secrets.sh
```

## 第九步：部署应用

推送代码到 GitHub：

```bash
git add .
git commit -m "Add Azure K8s deployment configuration"
git push origin main
```

GitHub Actions 会自动开始部署流程。

## 验证部署

### 在 Azure 门户查看

1. 进入 AKS 集群
2. 左侧点击 **"工作负载"** 查看 Pod 状态
3. 左侧点击 **"服务和入口"** 查看服务状态

### 获取外部访问地址

1. 在 AKS 的 **"服务和入口"** 页面
2. 找到 `backend-service-external`
3. 复制外部 IP 地址

## 成本优化建议

### 1. 使用 Spot 节点池

1. 在 AKS 集群中，左侧点击 **"节点池"**
2. 点击 **"+ 添加节点池"**
3. 配置：
   - **节点池名称**: `spotpool`
   - **模式**: `用户`
   - **节点大小**: `Standard_B2s`
   - **启用 Azure Spot 实例**: ✅
   - **逐出策略**: `删除`
   - **Spot 最大价格**: `-1` (按需价格)
   - **节点计数**: `1-3`

### 2. 启用集群自动缩放器

1. 在节点池设置中
2. 启用 **"启用自动缩放"**
3. 设置 **"最小节点计数"**: `1`
4. 设置 **"最大节点计数"**: `5`

## 监控和故障排查

### 查看应用日志

1. 在 AKS 集群中，点击 **"见解"**
2. 选择 **"容器"** 标签页
3. 找到你的 backend pod 并查看日志

### 查看部署状态

1. 在 GitHub 仓库的 **"Actions"** 标签页
2. 查看最新的工作流运行状态
3. 点击查看详细日志

这样你就可以完全通过 Azure 门户界面完成 K8s 集群的创建和配置，然后享受 GitHub Actions 带来的自动化部署便利！
