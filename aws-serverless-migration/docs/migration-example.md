# 实际迁移示例：从 Express.js 到 Serverless

## 原始 Express.js 应用分析

你的传统 Express 应用结构：

```javascript
// backend/src/app.ts
const app = express();

// 全局中间件
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Serverless 迁移后的架构

### 1. 路由拆分对比

#### Express.js 方式 (集中式)

```javascript
// routes/routes.ts
router.post('/products', createProduct);
router.get('/products/:id', getProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// 所有路由在同一个进程中
```

#### Serverless 方式 (分布式)

```yaml
# serverless.yml
functions:
  createProduct:    # 独立的Lambda函数
    handler: src/handlers/products.createProduct
    events:
      - http: { path: /api/products, method: post }

  getProduct:       # 另一个独立的Lambda函数
    handler: src/handlers/products.getProduct
    events:
      - http: { path: /api/products/{id}, method: get }
```

### 2. 中间件迁移对比

#### Express.js 中间件链

```javascript
// 全局中间件，所有请求都经过
app.use(cors(corsOptions)); // CORS处理
app.use(helmet()); // 安全头
app.use(morgan('dev')); // 日志记录
app.use(express.json()); // JSON解析
app.use(authMiddleware); // 身份验证

// 请求流程：请求 → CORS → 安全 → 日志 → JSON解析 → 认证 → 业务逻辑
```

#### Serverless 分散处理

```yaml
# serverless.yml - 每个函数独立配置
functions:
  createProduct:
    handler: src/handlers/products.createProduct
    events:
      - http:
          path: /api/products
          method: post
          cors: true # API Gateway处理CORS
          authorizer: # Lambda授权器
            name: authorizerFunc
            type: request
```

```javascript
// src/handlers/products.createProduct.ts
export const createProduct = async (event: APIGatewayProxyEvent) => {
  // 手动处理JSON解析（Express自动处理）
  const body = JSON.parse(event.body || '{}');

  // 手动处理响应格式（Express自动处理）
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // 手动设置CORS
    },
    body: JSON.stringify(result),
  };
};
```

### 3. 数据库连接迁移

#### Express.js - 应用级连接池

```javascript
// app.ts - 应用启动时建立连接
const start = async () => {
  // 1. 建立数据库连接池
  const isConnected = await testConnection();

  // 2. 连接MongoDB
  await connectMongoDB();

  // 3. 同步数据库
  await syncDatabase();

  // 4. 启动服务器 - 连接池持续存在
  app.listen(PORT);
};

// 所有请求共享同一个连接池
```

#### Serverless - 函数级连接管理

```javascript
// src/handlers/products.createProduct.ts
import { getDBConnection } from '../utils/database';

export const createProduct = async (event: APIGatewayProxyEvent) => {
  // 每个函数执行时可能需要新建连接
  const db = await getDBConnection();

  try {
    // 业务逻辑
    const result = await db.query('INSERT INTO products...');
    return successResponse(result);
  } finally {
    // 函数结束时关闭连接（或复用容器时保持连接）
    await db.end();
  }
};
```

### 4. 错误处理迁移

#### Express.js - 全局错误处理

```javascript
// app.ts - 全局错误中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 任何路由的错误都会被捕获
```

#### Serverless - 函数级错误处理

```javascript
// 每个函数都需要独立的错误处理
export const createProduct = async (event: APIGatewayProxyEvent) => {
  try {
    // 业务逻辑
    return successResponse(result);
  } catch (error) {
    console.error('Create product error:', error);

    // 手动返回错误响应
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
```

### 5. 认证机制迁移

#### Express.js - 中间件认证

```javascript
// middleware/auth.ts
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 设置用户信息到请求对象
    next(); // 继续到下一个中间件
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// 使用中间件
router.post('/cart', authMiddleware, addToCart);
```

#### Serverless - 授权器函数

```javascript
// src/handlers/auth.authorizer.ts
export const authorizer = async (event: APIGatewayAuthorizerEvent) => {
  const token = event.authorizationToken?.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 返回授权策略
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        // 传递给业务函数的上下文
        userId: decoded.userId,
        email: decoded.email,
      },
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

// 业务函数获取用户信息
export const addToCart = async (event: APIGatewayProxyEvent) => {
  // 从授权器上下文获取用户信息
  const userId = event.requestContext?.authorizer?.userId;
  // 处理业务逻辑...
};
```

## 关键差异总结

| 方面         | Express.js                | Serverless              |
| ------------ | ------------------------- | ----------------------- |
| **请求处理** | 中间件链式处理            | 事件驱动处理            |
| **数据解析** | 自动解析 (express.json()) | 手动解析 (JSON.parse()) |
| **响应格式** | 自动格式化 (res.json())   | 手动格式化 (返回对象)   |
| **错误处理** | 全局错误中间件            | 每个函数独立处理        |
| **认证**     | 中间件链                  | 授权器函数              |
| **CORS**     | 中间件配置                | API Gateway 配置        |
| **日志**     | 中间件记录                | CloudWatch 自动记录     |
| **连接管理** | 应用级连接池              | 函数级连接              |

## 迁移的优势

1. **自动扩展**: 无需手动管理服务器扩展
2. **成本优化**: 按执行次数付费，空闲时零成本
3. **运维简化**: AWS 管理基础设施
4. **高可用**: 自动故障转移和恢复
5. **安全性**: IAM 角色和 VPC 集成

## 迁移的挑战

1. **冷启动**: 首次执行有延迟
2. **调试复杂**: 分布式调试更困难
3. **本地开发**: 需要模拟 AWS 环境
4. **连接管理**: 数据库连接需要优化
5. **学习曲线**: 新的开发模式
