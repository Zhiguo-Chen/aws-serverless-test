# Serverless 跨域和权限验证总结

## ✅ 已实现的功能

### 1. CORS 跨域解决方案

- **全局配置**: 在 `serverless.yml` 中配置了 httpApi.cors
- **动态 CORS**: 支持多个前端域名，包括你的生产和开发环境
- **预检请求**: 添加了 OPTIONS 处理器处理预检请求
- **响应头**: 每个 API 响应都包含正确的 CORS 头

### 2. JWT 权限验证系统

- **Lambda 授权器**: 独立的授权函数验证 JWT token
- **上下文传递**: 用户信息通过 context 传递给业务函数
- **角色支持**: 支持基于角色的权限控制
- **详细日志**: 完整的授权日志用于调试

### 3. 安全特性

- **Token 验证**: 严格的 JWT token 验证
- **域名白名单**: 只允许指定域名的跨域请求
- **错误处理**: 统一的错误响应格式
- **日志记录**: 详细的安全日志

## 🔧 配置说明

### 支持的前端域名

```javascript
const allowedOrigins = [
  'https://my-demo.camdvr.org', // 生产环境
  'https://icy-sky-08145be00.6.azurestaticapps.net', // Azure静态应用
  'http://localhost:3001', // 本地开发
  'http://127.0.0.1:3001', // 本地开发(IP)
];
```

### 需要认证的 API 端点

- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加到购物车
- `POST /api/order` - 创建订单

### 公开的 API 端点

- `GET /health` - 健康检查
- `GET /api/products` - 获取产品列表
- `GET /api/products/{id}` - 获取单个产品
- `POST /api/login` - 用户登录
- `POST /api/register` - 用户注册
- `POST /api/upload` - 文件上传
- `OPTIONS /api/{proxy+}` - CORS 预检

## 🚀 使用方法

### 1. 前端发送认证请求

```javascript
// 登录获取token
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { token } = await loginResponse.json();

// 使用token访问受保护的API
const cartResponse = await fetch('/api/cart', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 2. 本地开发测试

```bash
# 启动本地服务器
npm run dev

# 测试API
npm run test:api:dev

# 手动测试CORS
curl -X OPTIONS http://localhost:3000/api/products \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST"
```

### 3. 部署到 AWS

```bash
# 开发环境部署
npm run deploy

# 生产环境部署
npm run deploy:prod

# 测试线上API
API_BASE=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev npm run test:api
```

## 🔍 调试指南

### 1. CORS 问题调试

- 检查浏览器开发者工具的 Network 标签
- 确认 OPTIONS 预检请求返回 200 状态码
- 验证响应头包含正确的 CORS 信息

### 2. 权限验证调试

- 查看 CloudWatch 日志中的授权器日志
- 确认 JWT token 格式正确 (`Bearer <token>`)
- 验证 token 未过期且签名有效

### 3. 常见错误解决

```javascript
// 错误: "Access to fetch at ... has been blocked by CORS policy"
// 解决: 检查域名是否在allowedOrigins列表中

// 错误: "Unauthorized"
// 解决: 检查Authorization header格式和token有效性

// 错误: "User not authenticated"
// 解决: 确认授权器正确传递了userId到context
```

## 📊 与 Express.js 对比

| 特性          | Express.js     | Serverless             |
| ------------- | -------------- | ---------------------- |
| **CORS 配置** | 中间件一次配置 | 多层配置(Gateway+代码) |
| **权限验证**  | 中间件链式处理 | 独立授权器函数         |
| **性能**      | 内存中处理     | 网关层处理(更快)       |
| **扩展性**    | 手动扩展       | 自动扩展               |
| **调试**      | 本地调试简单   | 需要模拟 AWS 环境      |
| **成本**      | 固定服务器成本 | 按请求付费             |

## 🎯 最佳实践

### 1. 安全建议

- 使用强密码的 JWT_SECRET
- 设置合理的 token 过期时间
- 定期轮换密钥
- 限制 CORS 域名到最小必要集合

### 2. 性能优化

- 使用连接池优化数据库连接
- 合理设置 Lambda 内存和超时
- 启用 API Gateway 缓存
- 使用 CloudFront CDN

### 3. 监控和日志

- 设置 CloudWatch 告警
- 监控授权失败率
- 记录详细的安全日志
- 定期审查访问模式

## 🔄 迁移检查清单

- [x] CORS 配置完成
- [x] JWT 授权器实现
- [x] 受保护路由配置
- [x] 错误处理统一
- [x] 日志记录完善
- [x] 测试脚本准备
- [ ] 数据库连接优化
- [ ] 生产环境部署
- [ ] 监控告警设置
- [ ] 文档更新完成

现在你的 Serverless 应用已经具备了完整的 CORS 和权限验证功能，可以安全地处理来自多个前端域名的请求！
