# RDS 连接故障排除指南

## 🎯 当前状况

你的配置是正确的！连接失败是预期的，因为：

1. **RDS Proxy** 只能从 VPC 内部访问（安全设计）
2. **RDS 直连** 需要安全组允许你的 IP 访问

## 🚀 推荐的测试流程

### 方案 1: 直接部署到 AWS（推荐）

这是最简单的方法，因为你的配置已经正确：

```bash
# 1. 部署到 AWS
serverless deploy --stage dev

# 2. 测试健康检查端点
curl https://your-api-gateway-url/health

# 3. 查看 Lambda 日志
serverless logs -f health --stage dev
```

### 方案 2: 临时开放 RDS 直连用于本地开发

如果你需要本地开发，可以临时配置安全组：

#### 步骤 1: 获取你的公网 IP

```bash
curl ifconfig.me
```

#### 步骤 2: 更新安全组规则

在 AWS 控制台中：

1. 进入 EC2 → Security Groups
2. 找到 `sg-03174d2c2e890a3ed`
3. 添加入站规则：
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your IP/32

#### 步骤 3: 获取 RDS 实例端点

```bash
aws rds describe-db-instances --db-instance-identifier myapp-postgres --query 'DBInstances[0].Endpoint.Address' --output text
```

#### 步骤 4: 更新本地配置

创建 `.env.development` 文件：

```bash
# 复制 .env.local 并更新 DB_HOST
cp .env.local .env.development
# 然后手动更新 DB_HOST 为实际的 RDS 端点
```

### 方案 3: 使用 AWS Cloud9

1. 在 AWS 控制台创建 Cloud9 环境
2. 选择与 RDS 相同的 VPC 和子网
3. 在 Cloud9 中克隆代码并测试

## 🔍 验证部署是否成功

### 1. 检查 Lambda 函数状态

```bash
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `ecommerce-serverless`)].FunctionName'
```

### 2. 测试 API 端点

```bash
# 获取 API Gateway URL
serverless info --stage dev

# 测试健康检查
curl https://your-api-gateway-url/health

# 测试产品 API
curl https://your-api-gateway-url/api/products
```

### 3. 查看 CloudWatch 日志

```bash
# 查看特定函数日志
serverless logs -f getProducts --stage dev --tail

# 或在 AWS 控制台查看
# CloudWatch → Log groups → /aws/lambda/ecommerce-serverless-dev-*
```

## 🐛 常见错误及解决方案

### 错误 1: Lambda 超时

```
Task timed out after 30.00 seconds
```

**原因**: VPC 配置问题，Lambda 无法访问外网

**解决方案**:

1. 检查子网是否有 NAT Gateway
2. 检查路由表配置
3. 确认安全组允许出站流量

### 错误 2: 数据库连接被拒绝

```
connection refused
```

**原因**: 安全组或网络配置问题

**解决方案**:

1. 检查 RDS 安全组是否允许来自 Lambda 安全组的访问
2. 确认 RDS 实例状态为 "available"
3. 验证 RDS Proxy 状态

### 错误 3: DNS 解析失败

```
getaddrinfo ENOTFOUND
```

**原因**: VPC DNS 配置问题

**解决方案**:

1. 确认 VPC 启用了 DNS 解析和 DNS 主机名
2. 检查 RDS Proxy 端点地址是否正确

## 🎯 生产环境最佳实践

### 1. 使用 Secrets Manager

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

### 2. 连接池配置

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

### 3. 错误处理和重试

```javascript
async function executeQuery(query, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      const result = await client.query(query, params);
      client.release();
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 📊 监控和告警

### CloudWatch 指标

- Lambda 执行时间
- Lambda 错误率
- RDS 连接数
- RDS CPU 使用率

### 推荐告警

- Lambda 错误率 > 5%
- Lambda 执行时间 > 10 秒
- RDS 连接数 > 80%

## 🎉 总结

你的配置是正确的！现在可以：

1. **立即部署**: `serverless deploy --stage dev`
2. **测试 API**: 使用部署后的 API Gateway URL
3. **查看日志**: 通过 CloudWatch 或 `serverless logs`

本地连接失败是正常的，这证明了 AWS 的安全设计正在工作！
