# Serverless 跨域和权限验证完整指南

## 1. CORS 跨域问题解决

### 方法一：serverless.yml 全局配置 (推荐)

```yaml
# serverless.yml
provider:
  name: aws
  runtime: nodejs18.x
  # 全局 CORS 配置
  httpApi:
    cors:
      allowedOrigins:
        - https://my-demo.camdvr.org
        - https://icy-sky-08145be00.6.azurestaticapps.net
        - http://localhost:3001
        - http://127.0.0.1:3001
      allowedHeaders:
        - Content-Type
        - Authorization
        - X-Amz-Date
        - X-Api-Key
      allowedMethods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      allowCredentials: true

functions:
  createProduct:
    handler: src/handlers/products.createProduct
    events:
      - httpApi: # 使用 httpApi 而不是 http
          path: /api/products
          method: post
```

### 方法二：函数级别 CORS 配置

```yaml
# serverless.yml
functions:
  createProduct:
    handler: src/handlers/products.createProduct
    events:
      - http:
          path: /api/products
          method: post
          cors:
            origin:
              - https://my-demo.camdvr.org
              - http://localhost:3001
            headers:
              - Content-Type
              - Authorization
            allowCredentials: true
```

### 方法三：代码中手动处理 CORS

```javascript
// src/utils/response.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 或指定域名
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

export const successResponse = (data: any, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify(data),
});

export const errorResponse = (message: string, statusCode = 500) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify({ error: message }),
});
```

### 方法四：处理 OPTIONS 预检请求

```javascript
// src/handlers/cors.ts
export const corsHandler = async (event: APIGatewayProxyEvent) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(event),
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24小时
    },
    body: '',
  };
};

// 动态获取允许的域名
const getAllowedOrigin = (event: APIGatewayProxyEvent): string => {
  const origin = event.headers.origin || event.headers.Origin;
  const allowedOrigins = [
    'https://my-demo.camdvr.org',
    'https://icy-sky-08145be00.6.azurestaticapps.net',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};
```

```yaml
# serverless.yml - 添加 OPTIONS 处理
functions:
  corsHandler:
    handler: src/handlers/cors.corsHandler
    events:
      - http:
          path: /api/{proxy+}
          method: options
          cors: true
```

## 2. 权限验证系统

### 方法一：Lambda 授权器 (推荐)

```javascript
// src/handlers/auth.authorizer.ts
import * as jwt from 'jsonwebtoken';

export const authorizer = async (event: APIGatewayAuthorizerEvent) => {
  try {
    console.log('Authorizer event:', JSON.stringify(event, null, 2));

    // 从 Authorization header 获取 token
    const token = event.authorizationToken?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    // 验证 JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    console.log('Token decoded:', decoded);

    // 返回授权策略
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn, // 允许访问当前资源
          },
        ],
      },
      context: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
      },
    };
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized'); // 这会返回 401
  }
};
```

```yaml
# serverless.yml - 配置授权器
functions:
  # 授权器函数
  authorizerFunc:
    handler: src/handlers/auth.authorizer

  # 需要认证的业务函数
  getCart:
    handler: src/handlers/cart.getCart
    events:
      - http:
          path: /api/cart
          method: get
          cors: true
          authorizer:
            name: authorizerFunc
            type: request
            identitySource: method.request.header.Authorization
```

### 方法二：函数内部验证

```javascript
// src/handlers/cart.getCart.ts
import * as jwt from 'jsonwebtoken';

export const getCart = async (event: APIGatewayProxyEvent) => {
  try {
    // 手动验证 token
    const authHeader = event.headers.Authorization || event.headers.authorization;

    if (!authHeader) {
      return errorResponse('Authorization header required', 401);
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      return errorResponse('Invalid token', 401);
    }

    const userId = decoded.userId;

    // 获取购物车数据
    const cartItems = await getCartFromDB(userId);

    return successResponse(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse('Internal server error', 500);
  }
};
```

### 方法三：基于角色的权限控制 (RBAC)

```javascript
// src/utils/auth.ts
export const checkPermission = (
  userRole: string,
  requiredRole: string,
): boolean => {
  const roleHierarchy = {
    admin: 3,
    manager: 2,
    user: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// src/handlers/products.deleteProduct.ts
export const deleteProduct = async (event: APIGatewayProxyEvent) => {
  try {
    // 从授权器上下文获取用户信息
    const userRole = event.requestContext?.authorizer?.role;

    // 检查权限
    if (!checkPermission(userRole, 'admin')) {
      return errorResponse('Insufficient permissions', 403);
    }

    const { id } = event.pathParameters || {};

    // 执行删除操作
    await deleteProductFromDB(id);

    return successResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    return errorResponse('Delete failed', 500);
  }
};
```

## 3. 完整的认证流程示例

### 登录函数

```javascript
// src/handlers/auth.login.ts
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

export const login = async (event: APIGatewayProxyEvent) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // 查找用户
    const user = await getUserByEmail(email);

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
};
```

## 4. 前端集成示例

```javascript
// 前端代码示例
class ApiClient {
  constructor(baseURL, token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 登录
  async login(email, password) {
    const response = await this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.token;
    return response;
  }

  // 获取购物车 (需要认证)
  async getCart() {
    return this.request('/api/cart');
  }

  // 创建产品 (需要管理员权限)
  async createProduct(productData) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }
}

// 使用示例
const api = new ApiClient('https://your-api-gateway-url.amazonaws.com/dev');

// 登录
await api.login('user@example.com', 'password');

// 访问受保护的资源
const cart = await api.getCart();
```

## 5. 调试和监控

### CloudWatch 日志

```javascript
// 在函数中添加详细日志
export const authorizer = async (event) => {
  console.log('Authorizer input:', JSON.stringify(event, null, 2));

  try {
    const result = {
      /* 授权结果 */
    };
    console.log('Authorizer output:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Authorizer error:', error);
    throw error;
  }
};
```

### 本地测试

```bash
# 使用 serverless-offline 本地测试
npm run dev

# 测试 CORS
curl -X OPTIONS http://localhost:3000/api/products \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

# 测试认证
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer your-jwt-token"
```

## 总结

Serverless 的 CORS 和权限验证与 Express 的主要区别：

| 特性         | Express.js     | Serverless                 |
| ------------ | -------------- | -------------------------- |
| **CORS**     | 中间件统一处理 | API Gateway 配置 + 响应头  |
| **权限验证** | 中间件链       | Lambda 授权器 + 上下文传递 |
| **配置方式** | 代码配置       | 声明式配置 + 代码实现      |
| **性能**     | 运行时处理     | 网关层处理 (更快)          |
| **调试**     | 本地调试容易   | 需要模拟 AWS 环境          |
