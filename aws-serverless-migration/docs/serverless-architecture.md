# Serverless Framework 架构解析

## 1. 整体工作流程

```
前端请求 → API Gateway → Lambda函数 → 返回响应
```

### 详细流程：

1. **前端发送请求**: `POST https://api.example.com/api/products`
2. **API Gateway 接收**: AWS API Gateway 根据路由规则匹配请求
3. **触发 Lambda**: API Gateway 调用对应的 Lambda 函数
4. **执行业务逻辑**: Lambda 函数处理请求，访问数据库等
5. **返回响应**: Lambda 返回结果给 API Gateway，再返回给前端

## 2. 路由映射机制

### serverless.yml 中的路由定义：

```yaml
functions:
  createProduct:
    handler: src/handlers/products.createProduct # 指向具体的处理函数
    events:
      - http:
          path: /api/products # API路径
          method: post # HTTP方法
          cors: true # 启用CORS
```

### 实际生成的 AWS 资源：

- **API Gateway**: 创建 REST API
- **Lambda 函数**: 每个 function 对应一个 Lambda
- **IAM 角色**: 自动创建执行权限
- **CloudFormation**: 管理所有资源

## 3. 请求解析过程

### 路径参数解析：

```yaml
# 配置
path: /api/products/{id}

# 前端请求
GET /api/products/123

# Lambda函数中获取
const { id } = event.pathParameters; // id = "123"
```

### 查询参数解析：

```javascript
// 前端请求: GET /api/products?page=1&limit=10
const { page, limit } = event.queryStringParameters;
```

### 请求体解析：

```javascript
// 前端请求: POST /api/products (JSON body)
const body = JSON.parse(event.body);
const { name, price } = body;
```

## 4. 认证授权机制

### JWT 授权器：

```yaml
authorizer:
  name: authorizerFunc # 自定义授权函数
  type: request # 请求级别授权
```

### 授权流程：

1. 前端在 Header 中发送 JWT token
2. API Gateway 调用授权函数验证 token
3. 授权成功后，继续执行业务函数
4. 授权失败，直接返回 401 错误

## 5. 环境变量和配置

### 全局环境变量：

```yaml
provider:
  environment:
    DB_HOST: ${env:DB_HOST} # 从系统环境变量读取
    S3_BUCKET: ${self:custom.s3Bucket} # 从custom配置读取
```

### 函数级别配置：

```yaml
functions:
  uploadImage:
    timeout: 30 # 超时时间30秒
    memorySize: 512 # 内存大小512MB
```
