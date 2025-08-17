# AWS Serverless 部署检查清单

## ✅ 已完成的配置

基于你提供的 AWS 资源信息，以下配置已经完成：

### 数据库配置

- ✅ **RDS Proxy 端点**: `ecommerce-postgres-proxy.proxy-czagks6ss4zh.ap-northeast-1.rds.amazonaws.com`
- ✅ **数据库凭据**: postgres/Welcome321
- ✅ **SSL 连接**: 已启用

### VPC 网络配置

- ✅ **安全组**: `sg-03174d2c2e890a3ed`
- ✅ **子网配置**:
  - `subnet-003c3d2b7025ce507`
  - `subnet-0be2bf2163b044539`
  - `subnet-0981380be2d557511`

### IAM 权限

- ✅ **RDS 访问权限**: 已配置
- ✅ **Secrets Manager 权限**: 已配置
- ✅ **VPC 网络权限**: 已配置

## 🔍 部署前验证步骤

### 1. 测试数据库连接

```bash
# 安装依赖
npm install

# 测试数据库连接
npm run db:test
```

如果连接成功，你会看到：

```
✅ 数据库连接成功！
📊 数据库信息:
   版本: PostgreSQL 15.x
   当前数据库: postgres
   当前用户: postgres
   服务器时间: 2025-01-17...
```

### 2. 验证 AWS 凭据

确保你的 AWS CLI 已配置：

```bash
aws sts get-caller-identity
```

### 3. 检查 Serverless Framework

```bash
# 检查 serverless 版本
serverless --version

# 验证配置
serverless print
```

## 🚀 部署步骤

### 开发环境部署

```bash
# 部署到开发环境
serverless deploy --stage dev

# 查看部署状态
serverless info --stage dev
```

### 生产环境部署

```bash
# 部署到生产环境
serverless deploy --stage prod

# 查看部署状态
serverless info --stage prod
```

## 📋 部署后验证

### 1. 检查 Lambda 函数

```bash
# 列出所有函数
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `ecommerce-serverless`)].FunctionName'

# 测试健康检查端点
curl https://your-api-gateway-url/health
```

### 2. 测试数据库连接

部署后，Lambda 函数应该能够连接到 RDS Proxy。检查 CloudWatch 日志：

```bash
# 查看函数日志
serverless logs -f health --stage dev
```

### 3. 验证 API 端点

```bash
# 测试产品 API
curl https://your-api-gateway-url/api/products

# 测试认证 API
curl -X POST https://your-api-gateway-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. Lambda 超时错误

```
Task timed out after 30.00 seconds
```

**解决方案**:

- 检查 VPC 配置中的 NAT Gateway
- 确认安全组允许出站流量
- 增加 Lambda 超时时间

#### 2. 数据库连接被拒绝

```
connection refused
```

**解决方案**:

- 检查安全组规则
- 确认 RDS Proxy 状态
- 验证子网路由表

#### 3. 权限错误

```
User is not authorized to perform: rds-db:connect
```

**解决方案**:

- 检查 IAM 角色权限
- 确认 RDS Proxy 的 IAM 认证配置

### 监控和日志

#### CloudWatch 日志组

- `/aws/lambda/ecommerce-serverless-dev-*`
- `/aws/lambda/ecommerce-serverless-prod-*`

#### 有用的 AWS CLI 命令

```bash
# 查看 RDS Proxy 状态
aws rds describe-db-proxies --db-proxy-name ecommerce-postgres-proxy

# 查看安全组规则
aws ec2 describe-security-groups --group-ids sg-03174d2c2e890a3ed

# 查看子网信息
aws ec2 describe-subnets --subnet-ids subnet-003c3d2b7025ce507 subnet-0be2bf2163b044539 subnet-0981380be2d557511
```

## 🎯 性能优化建议

### Lambda 配置优化

- **内存**: 根据实际使用情况调整（推荐 512MB-1024MB）
- **超时**: 数据库操作建议 30-60 秒
- **预留并发**: 生产环境考虑设置预留并发

### 数据库连接优化

- 使用连接池管理
- 设置合理的连接超时
- 监控连接数使用情况

### 成本优化

- 使用 RDS Proxy 减少连接开销
- 合理设置 Lambda 内存和超时
- 监控 CloudWatch 日志保留期

## 📞 支持联系

如果遇到问题，可以：

1. 查看 CloudWatch 日志详细错误信息
2. 检查 AWS 服务状态页面
3. 参考 AWS 文档和最佳实践

---

**注意**: 请确保在生产环境中使用强密码，并考虑使用 AWS Secrets Manager 来管理数据库凭据。
