# GitHub Secrets 配置模板

## 需要在 GitHub 仓库中添加的 Secrets

进入你的 GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. AZURE_CREDENTIALS

**名称**: `AZURE_CREDENTIALS`
**值**:

```json
{
  "clientId": "从Azure AD应用注册获取的应用程序ID",
  "clientSecret": "从Azure AD应用注册获取的客户端密码",
  "subscriptionId": "你的Azure订阅ID",
  "tenantId": "你的Azure AD租户ID"
}
```

### 2. ACR_USERNAME

**名称**: `ACR_USERNAME`
**值**: `从ACR访问密钥页面获取的用户名`

### 3. ACR_PASSWORD

**名称**: `ACR_PASSWORD`
**值**: `从ACR访问密钥页面获取的密码`

## 如何获取这些值

### Azure 订阅 ID

1. Azure 门户 → 搜索"订阅" → 点击你的订阅 → 复制订阅 ID

### 租户 ID

1. Azure 门户 → 搜索"Azure Active Directory" → 概述页面 → 复制租户 ID

### 应用程序 ID 和客户端密码

1. Azure 门户 → 搜索"Azure Active Directory" → 应用注册 → 找到"ecommerce-github-actions"
2. 应用程序 ID：在概述页面复制
3. 客户端密码：证书和密码页面 → 新建客户端密码

### ACR 用户名和密码

1. Azure 门户 → 搜索"容器注册表" → 选择你的 ACR
2. 访问密钥页面 → 启用管理员用户 → 复制用户名和密码

## 配置完成检查清单

- [ ] AZURE_CREDENTIALS 已添加
- [ ] ACR_USERNAME 已添加
- [ ] ACR_PASSWORD 已添加
- [ ] 更新了 `.github/workflows/deploy-backend.yml` 中的环境变量
- [ ] 运行了 `k8s/update-secrets.sh` 更新应用密钥
- [ ] 推送代码到 GitHub 触发部署
