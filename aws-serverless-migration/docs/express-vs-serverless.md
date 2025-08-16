# Express.js vs Serverless 对比

## 传统 Express.js 架构

### 路由定义

```javascript
// app.js
const express = require('express');
const app = express();

// 单个服务器处理所有路由
app.post('/api/products', createProduct);
app.get('/api/products/:id', getProduct);
app.put('/api/products/:id', updateProduct);
app.delete('/api/products/:id', deleteProduct);

// 服务器持续运行
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 请求处理

```javascript
// 所有请求都在同一个进程中处理
const createProduct = (req, res) => {
  const { name, price } = req.body; // Express自动解析
  const id = req.params.id; // 路径参数
  const { page } = req.query; // 查询参数

  // 处理业务逻辑
  res.json({ success: true, product });
};
```

## Serverless 架构

### 路由定义

```yaml
# serverless.yml - 声明式配置
functions:
  createProduct:
    handler: src/handlers/products.createProduct # 独立函数
    events:
      - http:
          path: /api/products
          method: post

  getProduct:
    handler: src/handlers/products.getProduct # 另一个独立函数
    events:
      - http:
          path: /api/products/{id}
          method: get
```

### 请求处理

```javascript
// 每个函数都是独立的Lambda
export const createProduct = async (event: APIGatewayProxyEvent) => {
  // 手动解析事件对象
  const body = JSON.parse(event.body || '{}');
  const { name, price } = body;
  const { id } = event.pathParameters || {};
  const { page } = event.queryStringParameters || {};

  // 必须返回特定格式的响应
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, product }),
  };
};
```

## 主要区别

| 特性         | Express.js         | Serverless           |
| ------------ | ------------------ | -------------------- |
| **部署模式** | 单个服务器持续运行 | 按需执行的独立函数   |
| **扩展性**   | 手动扩展服务器     | 自动扩展到零或无限   |
| **成本**     | 固定服务器成本     | 按执行次数付费       |
| **冷启动**   | 无冷启动           | 有冷启动延迟         |
| **状态管理** | 可以保持内存状态   | 无状态，每次执行独立 |
| **路由**     | 代码中定义         | 配置文件声明         |
| **中间件**   | Express 中间件     | 授权器和层           |
| **错误处理** | 全局错误处理       | 每个函数独立处理     |

## 请求生命周期对比

### Express.js 流程

```
请求 → 中间件链 → 路由处理器 → 响应
     ↓
  身份验证 → 日志记录 → 业务逻辑 → 错误处理
```

### Serverless 流程

```
请求 → API Gateway → 授权器 → Lambda函数 → 响应
     ↓              ↓         ↓
   路由匹配      JWT验证    业务逻辑
```

## 数据库连接对比

### Express.js - 连接池

```javascript
// 应用启动时创建连接池
const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20, // 最大连接数
});

// 复用连接
app.post('/api/products', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM products');
  client.release(); // 归还连接到池
  res.json(result.rows);
});
```

### Serverless - 每次新连接

```javascript
// 每个Lambda执行都可能需要新连接
export const getProducts = async (event) => {
  // 冷启动时创建连接
  const client = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
  });

  await client.connect();
  const result = await client.query('SELECT * FROM products');
  await client.end(); // 关闭连接

  return successResponse(result.rows);
};
```

## 优化策略对比

### Express.js 优化

- 使用集群模式
- 负载均衡器
- 缓存中间件
- 连接池优化

### Serverless 优化

- 预热函数避免冷启动
- 连接复用（容器重用）
- 合理设置内存和超时
- 使用层共享代码

## 何时选择哪种架构？

### 选择 Express.js 当：

- 需要长连接（WebSocket）
- 有复杂的中间件需求
- 需要保持应用状态
- 对延迟要求极高
- 团队熟悉传统架构

### 选择 Serverless 当：

- 流量不稳定或有明显峰谷
- 希望零运维
- 成本敏感（低流量时）
- 微服务架构
- 快速原型开发

## 迁移策略

### 从 Express 到 Serverless

1. **拆分路由**: 每个路由变成独立函数
2. **重构中间件**: 转换为授权器或工具函数
3. **数据库连接**: 优化连接管理
4. **错误处理**: 每个函数独立处理
5. **测试调整**: 适应新的测试模式
