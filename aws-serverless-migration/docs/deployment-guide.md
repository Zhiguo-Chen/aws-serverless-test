# 🚀 Serverless 部署指南

## 部署前准备

### 1. AWS 凭证配置

```bash
# 安装 AWS CLI
brew install awscli  # macOS
# 或
pip install awscli

# 配置 AWS 凭证
aws configure
# 输入你的:
# AWS Access Key ID
# AWS Secret Access Key
# Default region (例如: us-east-1)
# Default output format (json)
```

### 2. 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，设置生产环境的值
# 特别重要的变量:
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
OPENAI_API_KEY=sk-your-real-openai-api-key
GEMINI_API_KEY=your-real-gemini-api-key
DB_HOST=your-production-database-host
DB_PASSWORD=your-production-database-password
```

## 部署步骤

### 开发环境部署

```bash
# 1. 确保依赖已安装
npm install

# 2. 构建项目
npm run build

# 3. 部署到开发环境
npm run deploy

# 部署完成后会显示 API Gateway 的 URL:
# endpoints:
#   POST - https://abc123def.execute-api.us-east-1.amazonaws.com/dev/api/login
#   GET - https://abc123def.execute-api.us-east-1.amazonaws.com/dev/api/products
#   ...
```

### 生产环境部署

```bash
# 部署到生产环境
npm run deploy:prod

# 这会创建一个新的 stage: prod
# endpoints:
#   POST - https://abc123def.execute-api.us-east-1.amazonaws.com/prod/api/login
#   GET - https://abc123def.execute-api.us-east-1.amazonaws.com/prod/api/products
#   ...
```

## 部署后验证

### 1. 测试 API 端点

```bash
# 设置 API 基础 URL
export API_BASE="https://your-api-id.execute-api.us-east-1.amazonaws.com/dev"

# 测试健康检查
curl $API_BASE/health

# 测试登录
curl -X POST $API_BASE/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# 测试产品列表
curl $API_BASE/api/products
```

### 2. 运行自动化测试

```bash
# 测试线上 API
API_BASE=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev node test-working-features.js
```

## AWS 资源管理

### 查看部署的资源

```bash
# 查看 CloudFormation 堆栈
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# 查看 Lambda 函数
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `ecommerce-serverless`)]'

# 查看 API Gateway
aws apigateway get-rest-apis --query 'items[?name==`dev-ecommerce-serverless`]'
```

### 查看日志

```bash
# 查看特定函数的日志
serverless logs -f login -s dev

# 实时查看日志
serverless logs -f login -s dev -t
```

## 环境管理

### 多环境配置

```yaml
# serverless.yml 中的环境配置
provider:
  stage: ${opt:stage, 'dev'}
  environment:
    STAGE: ${self:provider.stage}
    DB_HOST: ${env:DB_HOST_${self:provider.stage}, ${env:DB_HOST}}
```

### 环境变量优先级

1. 命令行参数: `--stage prod`
2. 环境变量: `STAGE=prod`
3. serverless.yml 默认值: `'dev'`

## 成本优化

### 1. Lambda 配置优化

```yaml
functions:
  login:
    handler: src/handlers/auth.login
    memorySize: 256 # 根据实际需求调整
    timeout: 10 # 根据实际需求调整
    reservedConcurrency: 5 # 限制并发数
```

### 2. API Gateway 缓存

```yaml
provider:
  apiGateway:
    caching:
      enabled: true
      ttlInSeconds: 300 # 5分钟缓存
```

### 3. 监控和告警

```bash
# 设置 CloudWatch 告警
aws cloudwatch put-metric-alarm \
  --alarm-name "HighLambdaErrors" \
  --alarm-description "Lambda error rate too high" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## 安全配置

### 1. IAM 角色最小权限

```yaml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - s3:GetObject
            - s3:PutObject
          Resource: 'arn:aws:s3:::${self:custom.s3Bucket}/*'
        # 只添加必要的权限
```

### 2. VPC 配置 (可选)

```yaml
provider:
  vpc:
    securityGroupIds:
      - sg-xxxxxxxxx
    subnetIds:
      - subnet-xxxxxxxxx
      - subnet-yyyyyyyyy
```

### 3. 环境变量加密

```bash
# 使用 AWS Secrets Manager
aws secretsmanager create-secret \
  --name "ecommerce-serverless/jwt-secret" \
  --secret-string "your-super-secret-jwt-key"
```

## 故障排除

### 常见问题

#### 1. 部署失败

```bash
# 检查 CloudFormation 事件
aws cloudformation describe-stack-events --stack-name ecommerce-serverless-dev

# 检查权限
aws sts get-caller-identity
```

#### 2. Lambda 函数错误

```bash
# 查看详细日志
serverless logs -f functionName -s dev

# 检查环境变量
aws lambda get-function-configuration --function-name ecommerce-serverless-dev-login
```

#### 3. API Gateway 问题

```bash
# 测试 API Gateway
aws apigateway test-invoke-method \
  --rest-api-id your-api-id \
  --resource-id your-resource-id \
  --http-method POST
```

## 回滚和清理

### 回滚到上一个版本

```bash
# 查看部署历史
serverless deploy list

# 回滚到指定时间戳
serverless rollback -t timestamp
```

### 完全删除资源

```bash
# 删除整个堆栈
serverless remove

# 确认删除
aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE
```

## 监控和维护

### 1. CloudWatch Dashboard

- Lambda 函数执行次数
- 错误率和延迟
- API Gateway 请求数
- 成本分析

### 2. 定期维护

- 更新依赖包
- 检查安全漏洞
- 优化性能
- 备份重要数据

### 3. 自动化 CI/CD

```yaml
# GitHub Actions 示例
name: Deploy Serverless
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 性能优化建议

1. **冷启动优化**: 使用 Provisioned Concurrency
2. **包大小优化**: 使用 webpack 打包，排除不必要的依赖
3. **数据库连接**: 使用连接池，复用连接
4. **缓存策略**: API Gateway 缓存 + Redis
5. **CDN**: 静态资源使用 CloudFront

部署成功后，你的 Serverless 应用就可以自动扩展，按需付费了！🚀
