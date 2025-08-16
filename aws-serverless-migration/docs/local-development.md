# Serverless 本地开发和测试指南

## 🚀 本地开发环境设置

### 1. Serverless Offline (推荐方式)

#### 安装和配置

```bash
# 已经在 package.json 中包含了 serverless-offline
npm install

# 启动本地服务器
npm run dev
# 或者
serverless offline

# 指定端口启动
serverless offline --httpPort 3000
```

#### 启动后的输出

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   GET    | http://localhost:3000/health                                 │
│   POST   | http://localhost:3000/api/login                              │
│   POST   | http://localhost:3000/api/register                           │
│   GET    | http://localhost:3000/api/products                           │
│   GET    | http://localhost:3000/api/products/{id}                      │
│   POST   | http://localhost:3000/api/products                           │
│   PUT    | http://localhost:3000/api/products/{id}                      │
│   DELETE | http://localhost:3000/api/products/{id}                      │
│   GET    | http://localhost:3000/api/cart                               │
│   POST   | http://localhost:3000/api/cart                               │
│   POST   | http://localhost:3000/api/order                              │
│   POST   | http://localhost:3000/api/chat/message                       │
│   GET    | http://localhost:3000/api/chat/history/{sessionId}           │
│   DELETE | http://localhost:3000/api/chat/history/{sessionId}           │
│   POST   | http://localhost:3000/api/upload                             │
│   POST   | http://localhost:3000/api/upload/signed-url                  │
│   DELETE | http://localhost:3000/api/upload/{key+}                      │
│   OPTIONS| http://localhost:3000/api/{proxy+}                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Server ready: http://localhost:3000 🚀
```

## 2. 测试方法对比

### 方法 1: 内置测试脚本 (最简单)

```bash
# 运行完整的API测试套件
npm run test:api:dev

# 这会测试所有端点：健康检查、CORS、产品、认证、购物车、上传、聊天等
```

### 方法 2: cURL 命令行测试

```bash
# 健康检查
curl http://localhost:3000/health

# 获取产品列表
curl http://localhost:3000/api/products

# 登录 (获取token)
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 使用token访问受保护的API
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 测试聊天功能
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "model": "openai"}'

# 测试CORS预检请求
curl -X OPTIONS http://localhost:3000/api/products \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

### 方法 3: Postman/Insomnia 图形界面

#### Postman Collection 示例

```json
{
  "info": {
    "name": "Serverless E-commerce API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "authToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"test@example.com\", \"password\": \"password123\"}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 200) {",
              "    const response = pm.response.json();",
              "    pm.collectionVariables.set('authToken', response.token);",
              "}"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Cart",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/cart",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ]
      }
    },
    {
      "name": "Chat Message",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/chat/message",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"message\": \"Hello, can you help me?\", \"model\": \"openai\"}"
        }
      }
    }
  ]
}
```

### 方法 4: 前端集成测试

#### React 测试组件

```jsx
// TestComponent.jsx
import React, { useState } from 'react';

const APITester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const baseUrl = 'http://localhost:3000';

  const testEndpoint = async (name, url, options = {}) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data: data,
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    // 健康检查
    await testEndpoint('health', '/health');

    // 获取产品
    await testEndpoint('products', '/api/products');

    // 聊天测试
    await testEndpoint('chat', '/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello from React!',
        model: 'openai',
      }),
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>API Tester</h2>
      <button onClick={runTests} disabled={loading}>
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div style={{ marginTop: '20px' }}>
        {Object.entries(results).map(([name, result]) => (
          <div
            key={name}
            style={{
              margin: '10px 0',
              padding: '10px',
              border: '1px solid #ccc',
              backgroundColor: result.success ? '#e8f5e8' : '#ffe8e8',
            }}
          >
            <h3>{name}</h3>
            <p>Status: {result.status}</p>
            <p>Success: {result.success ? 'Yes' : 'No'}</p>
            {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
            {result.error && (
              <p style={{ color: 'red' }}>Error: {result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APITester;
```

## 3. 高级测试配置

### Jest 单元测试

```javascript
// tests/handlers/chat.test.js
const { handleMessage } = require('../../src/handlers/chat');

describe('Chat Handler', () => {
  test('should handle chat message', async () => {
    const event = {
      body: JSON.stringify({
        message: 'Hello',
        model: 'openai',
      }),
      headers: {},
      requestContext: {
        authorizer: {
          userId: 'test-user',
        },
      },
    };

    const result = await handleMessage(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.response).toBeDefined();
    expect(body.sessionId).toBeDefined();
  });
});
```

### 环境变量配置

```bash
# .env.local (本地开发用)
NODE_ENV=development
JWT_SECRET=your-local-jwt-secret
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key
DB_HOST=localhost
DB_NAME=ecommerce_dev
DB_USER=postgres
DB_PASSWORD=password
```

### Serverless Offline 高级配置

```yaml
# serverless.yml
custom:
  serverless-offline:
    httpPort: 3000
    host: 0.0.0.0
    stage: dev
    region: us-east-1
    printOutput: true
    # 模拟AWS环境变量
    environment:
      AWS_REGION: us-east-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
```

## 4. 调试技巧

### 1. 日志调试

```javascript
// 在处理器中添加详细日志
export const handleMessage = async (event) => {
  console.log('=== Chat Handler Debug ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Headers:', event.headers);
  console.log('Body:', event.body);
  console.log('Context:', event.requestContext);

  // ... 业务逻辑

  console.log('Response:', response);
  return response;
};
```

### 2. VS Code 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Serverless Offline",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/serverless",
      "args": ["offline", "--httpPort", "3000"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 3. 网络请求监控

```bash
# 使用 httpie 进行更友好的API测试
pip install httpie

# 测试API
http GET localhost:3000/health
http POST localhost:3000/api/login email=test@example.com password=password123
http POST localhost:3000/api/chat/message message="Hello" model="openai"
```

## 5. 常见问题和解决方案

### 问题 1: CORS 错误

```bash
# 测试CORS配置
curl -X OPTIONS http://localhost:3000/api/products \
  -H "Origin: http://localhost:3001" \
  -v
```

### 问题 2: 认证失败

```bash
# 检查JWT token格式
echo "YOUR_JWT_TOKEN" | base64 -d
```

### 问题 3: 环境变量未加载

```javascript
// 在处理器开头添加
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
});
```

## 6. 性能测试

### 使用 Artillery 进行负载测试

```yaml
# artillery-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'API Load Test'
    flow:
      - get:
          url: '/health'
      - post:
          url: '/api/chat/message'
          json:
            message: 'Load test message'
            model: 'openai'
```

```bash
# 安装和运行
npm install -g artillery
artillery run artillery-test.yml
```

## 总结

本地开发推荐流程：

1. **启动**: `npm run dev`
2. **快速测试**: `npm run test:api:dev`
3. **详细测试**: 使用 Postman 或 cURL
4. **调试**: 查看控制台日志
5. **集成测试**: 在前端应用中测试

这样你就可以像开发传统 Express 应用一样，在本地快速迭代和测试 Serverless 应用了！
