# 请求处理流程实例

## 示例：创建产品的完整流程

### 1. 前端发送请求

```javascript
// 前端代码
fetch('https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIs...',
  },
  body: JSON.stringify({
    name: 'iPhone 15',
    price: 999,
    category: 'electronics',
  }),
});
```

### 2. API Gateway 路由匹配

```yaml
# serverless.yml 中的配置
createProduct:
  handler: src/handlers/products.createProduct
  events:
    - http:
        path: /api/products # ✅ 匹配成功
        method: post # ✅ 方法匹配
        cors: true
```

### 3. Lambda 函数接收事件

```javascript
// src/handlers/products.createProduct
export const createProduct = async (event: APIGatewayProxyEvent) => {
  // event 对象包含所有请求信息
  console.log('Event:', JSON.stringify(event, null, 2));

  /*
  event 结构：
  {
    "httpMethod": "POST",
    "path": "/api/products",
    "pathParameters": null,
    "queryStringParameters": null,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
    },
    "body": "{\"name\":\"iPhone 15\",\"price\":999,\"category\":\"electronics\"}",
    "isBase64Encoded": false
  }
  */
};
```

### 4. 请求数据解析

```javascript
export const createProduct = async (event: APIGatewayProxyEvent) => {
  try {
    // 解析请求体
    const body = JSON.parse(event.body || '{}');
    const { name, price, category } = body;

    // 获取用户信息（如果有认证）
    const userId = event.requestContext?.authorizer?.userId;

    // 验证数据
    if (!name || !price) {
      return errorResponse('Name and price are required', 400);
    }

    // 业务逻辑处理
    const product = await createProductInDB({
      name,
      price,
      category,
      createdBy: userId,
    });

    // 返回成功响应
    return successResponse(product, 201);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
};
```

### 5. 响应格式化

```javascript
// utils/response.ts
export const successResponse = (data: any, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  },
  body: JSON.stringify(data),
});
```

### 6. 前端接收响应

```javascript
// 前端接收到的响应
const response = await fetch('/api/products', { ... });
const product = await response.json();

/*
响应数据：
{
  "id": "uuid-123",
  "name": "iPhone 15",
  "price": 999,
  "category": "electronics",
  "createdAt": "2024-01-01T00:00:00Z"
}
*/
```

## 路径参数示例

### 1. 配置带参数的路由

```yaml
getProduct:
  handler: src/handlers/products.getProduct
  events:
    - http:
        path: /api/products/{id} # {id} 是路径参数
        method: get
```

### 2. 前端请求

```javascript
// GET /api/products/uuid-123
fetch('/api/products/uuid-123');
```

### 3. Lambda 函数处理

```javascript
export const getProduct = async (event: APIGatewayProxyEvent) => {
  // 获取路径参数
  const { id } = event.pathParameters || {};

  if (!id) {
    return errorResponse('Product ID is required', 400);
  }

  const product = await getProductFromDB(id);
  return successResponse(product);
};
```

## 查询参数示例

### 1. 前端请求

```javascript
// GET /api/products?page=1&limit=10&category=electronics
fetch('/api/products?page=1&limit=10&category=electronics');
```

### 2. Lambda 函数处理

```javascript
export const getProducts = async (event: APIGatewayProxyEvent) => {
  // 获取查询参数
  const {
    page = '1',
    limit = '10',
    category,
  } = event.queryStringParameters || {};

  const products = await getProductsFromDB({
    page: parseInt(page),
    limit: parseInt(limit),
    category,
  });

  return successResponse(products);
};
```

## 认证流程示例

### 1. 配置认证

```yaml
addToCart:
  handler: src/handlers/cart.addToCart
  events:
    - http:
        path: /api/cart
        method: post
        authorizer:
          name: authorizerFunc # 使用自定义授权器
          type: request
```

### 2. 授权器函数

```javascript
// src/handlers/auth.authorizer
export const authorizer = async (event: APIGatewayAuthorizerEvent) => {
  try {
    const token = event.authorizationToken?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // 返回授权策略
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      },
      context: {
        userId: decoded.userId,
        email: decoded.email
      }
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};
```

### 3. 业务函数获取用户信息

```javascript
export const addToCart = async (event: APIGatewayProxyEvent) => {
  // 从授权器上下文获取用户信息
  const userId = event.requestContext?.authorizer?.userId;
  const userEmail = event.requestContext?.authorizer?.email;

  // 处理购物车逻辑
  const cartItem = await addItemToCart(userId, productData);
  return successResponse(cartItem);
};
```
