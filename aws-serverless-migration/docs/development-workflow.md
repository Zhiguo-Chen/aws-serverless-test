# Serverless 开发工作流程

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <your-repo>
cd aws-serverless-migration

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的API密钥
```

### 2. 启动本地开发服务器

```bash
# 启动 serverless offline
npm run dev

# 服务器将在 http://localhost:3000 启动
```

### 3. 验证服务器运行

```bash
# 快速健康检查
curl http://localhost:3000/health

# 或者运行完整测试
npm run test:local
```

## 🔧 开发工作流程

### 日常开发循环

1. **启动开发服务器**

   ```bash
   npm run dev
   ```

2. **编写/修改代码**

   - 修改 `src/handlers/` 中的处理器
   - 修改 `src/services/` 中的服务
   - 修改 `src/utils/` 中的工具函数

3. **测试更改**

   ```bash
   # 运行完整测试套件
   npm run test:local

   # 或者测试特定功能
   curl -X POST http://localhost:3000/api/chat/message \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "model": "openai"}'
   ```

4. **调试问题**

   - 查看终端中的 serverless offline 日志
   - 在代码中添加 `console.log()` 语句
   - 使用浏览器开发者工具检查网络请求

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

## 🧪 测试策略

### 测试层级

1. **快速验证** (30 秒)

   ```bash
   curl http://localhost:3000/health
   ```

2. **基础功能测试** (2 分钟)

   ```bash
   npm run test:api:dev
   ```

3. **完整测试套件** (5 分钟)

   ```bash
   npm run test:local
   ```

4. **前端集成测试** (手动)
   ```bash
   # 打开测试页面
   open test-frontend.html
   # 或者
   npm run test:frontend
   ```

### 测试工具选择

| 场景       | 推荐工具  | 命令                                |
| ---------- | --------- | ----------------------------------- |
| 快速验证   | cURL      | `curl http://localhost:3000/health` |
| API 测试   | 内置脚本  | `npm run test:local`                |
| 手动测试   | 测试页面  | `open test-frontend.html`           |
| 自动化测试 | Jest      | `npm test`                          |
| 负载测试   | Artillery | `artillery run test-config.yml`     |

## 🐛 调试技巧

### 1. 查看详细日志

```javascript
// 在处理器中添加调试日志
export const handleMessage = async (event) => {
  console.log('=== DEBUG INFO ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Headers:', event.headers);
  console.log('Body:', event.body);
  console.log('==================');

  // ... 业务逻辑
};
```

### 2. 环境变量调试

```javascript
// 检查环境变量是否正确加载
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
});
```

### 3. 网络请求调试

```bash
# 使用 -v 参数查看详细的HTTP交互
curl -v -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 4. CORS 问题调试

```bash
# 测试CORS预检请求
curl -X OPTIONS http://localhost:3000/api/products \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

## 📁 项目结构理解

```
aws-serverless-migration/
├── src/
│   ├── handlers/          # Lambda 处理器
│   │   ├── auth.ts       # 认证相关
│   │   ├── products.ts   # 产品管理
│   │   ├── cart.ts       # 购物车
│   │   ├── orders.ts     # 订单
│   │   ├── chat.ts       # AI聊天
│   │   ├── upload.ts     # 文件上传
│   │   └── health.ts     # 健康检查
│   ├── services/          # 业务服务
│   │   ├── openai.service.ts
│   │   ├── gemini.service.ts
│   │   └── grok.service.ts
│   ├── utils/            # 工具函数
│   │   ├── response.ts   # 响应格式化
│   │   └── database.ts   # 数据库连接
│   └── models/           # 数据模型
├── docs/                 # 文档
├── test-*.js            # 测试脚本
├── test-frontend.html   # 前端测试页面
├── serverless.yml       # Serverless 配置
├── package.json         # 项目配置
└── .env                 # 环境变量
```

## 🔄 常见开发场景

### 场景 1: 添加新的 API 端点

1. **在 serverless.yml 中添加函数定义**

   ```yaml
   functions:
     newEndpoint:
       handler: src/handlers/new.handler
       events:
         - http:
             path: /api/new-endpoint
             method: post
             cors: true
   ```

2. **创建处理器文件**

   ```javascript
   // src/handlers/new.ts
   import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
   import { successResponse, errorResponse } from '../utils/response';

   export const handler = async (
     event: APIGatewayProxyEvent,
   ): Promise<APIGatewayProxyResult> => {
     try {
       // 业务逻辑
       return successResponse({ message: 'Success' });
     } catch (error) {
       return errorResponse('Error occurred', 500);
     }
   };
   ```

3. **测试新端点**
   ```bash
   curl -X POST http://localhost:3000/api/new-endpoint \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### 场景 2: 修改现有功能

1. **修改处理器代码**
2. **Serverless Offline 会自动重载**
3. **测试修改**
   ```bash
   npm run test:local
   ```

### 场景 3: 添加认证保护

1. **在 serverless.yml 中添加授权器**

   ```yaml
   events:
     - http:
         path: /api/protected-endpoint
         method: post
         cors: true
         authorizer:
           name: authorizerFunc
           type: request
   ```

2. **在处理器中获取用户信息**
   ```javascript
   const userId = event.requestContext?.authorizer?.userId;
   ```

## 🚀 部署流程

### 开发环境部署

```bash
# 部署到 AWS (dev stage)
npm run deploy

# 测试线上API
API_BASE=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev npm run test:api
```

### 生产环境部署

```bash
# 部署到生产环境
npm run deploy:prod

# 测试生产API
API_BASE=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod npm run test:api
```

## 💡 最佳实践

### 1. 代码组织

- 保持处理器函数简洁，业务逻辑放在服务层
- 使用统一的响应格式
- 添加详细的错误处理和日志

### 2. 测试策略

- 每次修改后运行快速测试
- 提交前运行完整测试套件
- 使用多种测试工具验证功能

### 3. 环境管理

- 本地开发使用 .env 文件
- 生产环境使用 AWS Secrets Manager
- 不要提交敏感信息到代码库

### 4. 性能优化

- 合理设置 Lambda 内存和超时
- 使用连接复用减少冷启动
- 监控 CloudWatch 指标

## 🆘 常见问题解决

### 问题 1: 服务器启动失败

```bash
# 检查端口是否被占用
lsof -i :3000

# 使用不同端口启动
serverless offline --httpPort 3001
```

### 问题 2: API 调用失败

```bash
# 检查服务器日志
# 查看 serverless offline 终端输出

# 检查环境变量
node -e "console.log(process.env)"
```

### 问题 3: CORS 错误

```bash
# 检查CORS配置
curl -X OPTIONS http://localhost:3000/api/products -v
```

### 问题 4: 认证失败

```bash
# 检查JWT token格式
echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d
```

这个工作流程让你可以高效地开发和测试 Serverless 应用，就像开发传统的 Express 应用一样！
