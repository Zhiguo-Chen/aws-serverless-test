# AWS RDS 和 RDS Proxy 配置指南

## 已配置的信息

基于你提供的信息，已经更新了以下配置：

- **DB_PASSWORD**: Welcome321
- **DB instance identifier**: myapp-postgres
- **Master username**: postgres
- **Proxy identifier**: ecommerce-postgres-proxy
- **Secret name**: my-rds-db-credentials

## 需要你完成的配置步骤

### 1. 获取 RDS Proxy 端点

在 AWS 控制台中找到你的 RDS Proxy 端点：

1. 进入 RDS 控制台
2. 点击左侧菜单的 "Proxies"
3. 找到 `ecommerce-postgres-proxy`
4. 复制 "Endpoint" 地址

然后更新 `.env` 文件中的 `DB_HOST`：

```bash
DB_HOST=ecommerce-postgres-proxy.proxy-[实际的代理ID].ap-northeast-1.rds.amazonaws.com
```

### 2. 配置 VPC 信息

你需要获取以下 VPC 信息并更新到 `.env` 文件：

```bash
# 添加到 .env 文件
SECURITY_GROUP_ID=sg-xxxxxxxxxx  # Lambda 安全组 ID
SUBNET_ID_1=subnet-xxxxxxxxxx    # 私有子网 ID 1
SUBNET_ID_2=subnet-yyyyyyyyyy    # 私有子网 ID 2
```

#### 如何获取这些信息：

**安全组 ID:**

1. 进入 EC2 控制台 → Security Groups
2. 找到允许访问 RDS 的安全组
3. 确保该安全组允许出站流量到 RDS 端口 5432

**子网 ID:**

1. 进入 VPC 控制台 → Subnets
2. 找到你的 RDS 所在的私有子网
3. 选择至少 2 个不同可用区的子网

### 3. 验证 Secrets Manager

确认你的 Secret 包含正确的数据库凭据：

1. 进入 Secrets Manager 控制台
2. 找到 `my-rds-db-credentials`
3. 确认包含以下键值：
   - `username`: postgres
   - `password`: Welcome321
   - `host`: [RDS 实例端点]
   - `port`: 5432
   - `dbname`: postgres

### 4. 测试连接

部署前可以先测试连接：

```bash
# 安装依赖
npm install

# 本地测试（需要先配置 AWS 凭据）
npm run test:db-connection
```

### 5. 部署配置

```bash
# 部署到开发环境
serverless deploy --stage dev

# 部署到生产环境
serverless deploy --stage prod
```

## 推荐的生产环境配置

### 使用 Secrets Manager（推荐）

为了更安全地管理数据库凭据，建议使用 Secrets Manager：

1. 在代码中读取 Secret：

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getDatabaseCredentials() {
  const secret = await secretsManager
    .getSecretValue({
      SecretId: process.env.RDS_SECRET_NAME,
    })
    .promise();

  return JSON.parse(secret.SecretString);
}
```

2. 更新环境变量配置：

```yaml
environment:
  RDS_SECRET_NAME: my-rds-db-credentials
  # 移除明文密码配置
```

### 网络安全配置

1. **安全组规则**：

   - Lambda 安全组：允许出站到 RDS 端口 5432
   - RDS 安全组：只允许来自 Lambda 安全组的入站流量

2. **子网配置**：

   - Lambda 部署在私有子网
   - RDS 部署在数据库子网组

3. **NAT Gateway**：
   - 确保私有子网有 NAT Gateway 用于外网访问

## 故障排除

### 常见问题

1. **连接超时**：

   - 检查安全组配置
   - 确认子网路由表配置
   - 验证 NAT Gateway 配置

2. **权限错误**：

   - 检查 IAM 角色权限
   - 确认 Secrets Manager 权限

3. **DNS 解析失败**：
   - 确认 VPC 启用了 DNS 解析
   - 检查 RDS Proxy 端点地址

### 监控和日志

1. **CloudWatch 日志**：

   - 查看 Lambda 函数日志
   - 监控数据库连接错误

2. **RDS 监控**：
   - 查看 RDS 性能洞察
   - 监控连接数和查询性能

## 成本优化建议

1. **RDS Proxy 优势**：

   - 连接池管理，减少数据库连接数
   - 自动故障转移
   - IAM 数据库身份验证

2. **Lambda 配置**：

   - 合理设置内存和超时时间
   - 使用预留并发控制成本

3. **RDS 配置**：
   - 选择合适的实例类型
   - 启用自动备份和快照
   - 考虑使用 Aurora Serverless
