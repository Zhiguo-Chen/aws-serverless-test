# GitHub Actions 权限检查清单

## 🔍 当前错误分析

你遇到的错误表明服务主体缺少以下权限：

- 读取 AKS 集群状态
- 访问 Azure Container Registry

## ✅ 权限检查清单

### 1. 服务主体基本信息

- [ ] 已创建服务主体应用
- [ ] 已获取客户端 ID (Application ID)
- [ ] 已创建客户端密钥
- [ ] GitHub Secrets 中的 `AZURE_CREDENTIALS` 格式正确

### 2. 资源组权限

- [ ] 服务主体在资源组 `E-commerce` 有 `Contributor` 角色

### 3. AKS 集群权限

- [ ] 服务主体在 AKS 集群 `ecommerce-test-aks` 有 `Azure Kubernetes Service Cluster User Role`

### 4. ACR 权限

- [ ] 服务主体在 ACR `ecommercetest2025` 有 `AcrPush` 角色
- [ ] 服务主体在 ACR `ecommercetest2025` 有 `AcrPull` 角色

## 🛠️ 通过 Azure 门户修复步骤

### 修复资源组权限

1. Azure 门户 → 搜索 "资源组" → 选择 `E-commerce`
2. 左侧菜单 → "访问控制 (IAM)"
3. "+ 添加" → "添加角色分配"
4. 角色：`Contributor`
5. 成员：搜索并选择你的服务主体应用

### 修复 AKS 权限

1. Azure 门户 → 搜索 "Kubernetes" → 选择 `ecommerce-test-aks`
2. 左侧菜单 → "访问控制 (IAM)"
3. "+ 添加" → "添加角色分配"
4. 角色：`Azure Kubernetes Service Cluster User Role`
5. 成员：搜索并选择你的服务主体应用

### 修复 ACR 权限

1. Azure 门户 → 搜索 "容器注册表" → 选择 `ecommercetest2025`
2. 左侧菜单 → "访问控制 (IAM)"
3. 添加两个角色分配：
   - 角色：`AcrPush`，成员：你的服务主体
   - 角色：`AcrPull`，成员：你的服务主体

## 🔧 验证权限设置

### 在 Azure 门户验证

1. 进入资源组 `E-commerce`
2. "访问控制 (IAM)" → "角色分配"
3. 搜索你的服务主体名称
4. 确认显示所有必要的角色

### 测试 GitHub Actions

1. 推送代码触发工作流
2. 查看 Actions 日志确认权限问题已解决

## 🚨 常见问题

### Q: 找不到我的服务主体应用

**A:** 在 Azure Active Directory → 应用注册 中查找，确保使用正确的应用名称

### Q: 角色分配后仍然报错

**A:** 权限生效可能需要几分钟时间，等待 5-10 分钟后重试

### Q: 不确定服务主体名称

**A:** 检查你的 `AZURE_CREDENTIALS` secret 中的 `clientId`，然后在应用注册中根据此 ID 查找

## 📝 完成后的下一步

权限修复完成后：

1. 重新运行 GitHub Actions 工作流
2. 检查部署是否成功
3. 验证应用是否正常运行

如果仍有问题，检查 GitHub Actions 日志中的具体错误信息。
