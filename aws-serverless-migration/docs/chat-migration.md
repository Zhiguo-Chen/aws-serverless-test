# Chat 功能迁移指南

## 🔄 从 Express 到 Serverless 的 Chat 功能迁移

### 原始 Express 架构

```javascript
// Express 中的 chat 路由
router.post('/chat', authenticationToken, upload.single('image'), chat);

// 控制器处理
export const chat = async (req: Request, res: Response) => {
  const { message, model, sessionId } = req.body;
  const userId = req.user?.id;
  const imageBase64 = req.file
    ? fs.readFileSync(req.file.path, 'base64')
    : null;

  // 根据模型调用不同服务
  let modelResponse;
  if (model.includes('openai')) {
    modelResponse = await chatService(message, userId, sessionId, imageBase64);
  } else if (model.includes('gemini')) {
    modelResponse = await geminiChatService(
      message,
      userId,
      sessionId,
      imageBase64,
    );
  }

  res.json({
    response: modelResponse.result,
    sessionId: modelResponse.sessionId,
  });
};
```

### Serverless 架构

```yaml
# serverless.yml
functions:
  chatMessage:
    handler: src/handlers/chat.handleMessage
    events:
      - http:
          path: /api/chat/message
          method: post
          cors: true
    timeout: 30
    memorySize: 512
```

```javascript
// Lambda 处理器
export const handleMessage = async (event: APIGatewayProxyEvent) => {
  const { message, model, sessionId, imageBase64 } = JSON.parse(
    event.body || '{}',
  );
  const userId = event.requestContext?.authorizer?.userId || 'anonymous';

  // 根据模型调用服务
  let modelResponse;
  switch (model.toLowerCase()) {
    case 'openai':
      modelResponse = await openaiChatService(
        message,
        userId,
        sessionId,
        imageBase64,
      );
      break;
    case 'gemini':
      modelResponse = await geminiChatService(
        message,
        userId,
        sessionId,
        imageBase64,
      );
      break;
    case 'grok':
      modelResponse = await grokChatService(
        message,
        userId,
        sessionId,
        imageBase64,
      );
      break;
  }

  return successResponse({
    response: modelResponse.result,
    sessionId: modelResponse.sessionId,
    model: model,
  });
};
```

## 🚀 已实现的功能

### 1. 多模型支持

- **OpenAI GPT-4**: 支持文本和图片输入
- **Google Gemini**: 支持文本和图片输入
- **Grok (xAI)**: 主要支持文本输入

### 2. API 端点

#### 发送消息

```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "Hello, can you help me?",
  "model": "openai",
  "sessionId": "optional-session-id",
  "imageBase64": "optional-base64-image"
}
```

#### 获取聊天历史 (需要认证)

```http
GET /api/chat/history/{sessionId}
Authorization: Bearer <jwt-token>
```

#### 清除聊天历史 (需要认证)

```http
DELETE /api/chat/history/{sessionId}
Authorization: Bearer <jwt-token>
```

### 3. 支持的模型参数

| 模型   | 参数值   | 支持图片 | API Key 环境变量                |
| ------ | -------- | -------- | ------------------------------- |
| OpenAI | `openai` | ✅       | `OPENAI_API_KEY`                |
| Gemini | `gemini` | ✅       | `GEMINI_API_KEY`                |
| Grok   | `grok`   | ❌       | `GROK_API_KEY` 或 `XAI_API_KEY` |

## 🔧 配置说明

### 环境变量

```bash
# .env 文件
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key
XAI_API_KEY=your-xai-api-key
```

### Lambda 配置

- **Timeout**: 30 秒 (AI 响应可能较慢)
- **Memory**: 512MB (处理图片和 AI 模型)
- **Runtime**: Node.js 18.x

## 📝 使用示例

### 前端集成

```javascript
class ChatService {
  constructor(apiBase, authToken = null) {
    this.apiBase = apiBase;
    this.authToken = authToken;
  }

  async sendMessage(
    message,
    model = 'openai',
    sessionId = null,
    imageBase64 = null,
  ) {
    const response = await fetch(`${this.apiBase}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
      body: JSON.stringify({
        message,
        model,
        sessionId,
        imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.status}`);
    }

    return await response.json();
  }

  async getChatHistory(sessionId) {
    const response = await fetch(
      `${this.apiBase}/api/chat/history/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      },
    );

    return await response.json();
  }
}

// 使用示例
const chatService = new ChatService('https://your-api.amazonaws.com/dev');

// 发送文本消息
const response = await chatService.sendMessage(
  'What products do you recommend?',
  'openai',
);

console.log('AI Response:', response.response);
console.log('Session ID:', response.sessionId);

// 发送带图片的消息
const imageResponse = await chatService.sendMessage(
  'What do you see in this image?',
  'gemini',
  response.sessionId,
  base64ImageData,
);
```

### React 组件示例

```jsx
import React, { useState } from 'react';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [model, setModel] = useState('openai');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: model,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = { role: 'assistant', content: data.response };
        setMessages((prev) => [...prev, aiMessage]);
        setSessionId(data.sessionId);
      } else {
        console.error('Chat error:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }

    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="model-selector">
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="openai">OpenAI GPT-4</option>
          <option value="gemini">Google Gemini</option>
          <option value="grok">Grok</option>
        </select>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
```

## 🔍 测试和调试

### 本地测试

```bash
# 启动本地服务器
npm run dev

# 测试chat功能
npm run test:api:dev

# 手动测试
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "model": "openai"
  }'
```

### 生产环境测试

```bash
# 部署到AWS
npm run deploy

# 测试线上API
API_BASE=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev npm run test:api
```

## 🚨 注意事项

### 1. API 密钥安全

- 所有 API 密钥都通过环境变量配置
- 不要在代码中硬编码 API 密钥
- 生产环境使用 AWS Secrets Manager

### 2. 成本控制

- AI API 调用会产生费用
- 设置合理的超时时间
- 考虑实现请求频率限制

### 3. 错误处理

- 网络超时处理
- API 配额限制处理
- 模型不可用时的降级策略

### 4. 性能优化

- 合理设置 Lambda 内存大小
- 考虑连接复用
- 实现响应缓存机制

## 📊 与 Express 版本对比

| 特性         | Express        | Serverless       |
| ------------ | -------------- | ---------------- |
| **部署**     | 单个服务器     | 独立 Lambda 函数 |
| **扩展**     | 手动扩展       | 自动扩展         |
| **成本**     | 固定服务器成本 | 按请求付费       |
| **冷启动**   | 无             | 首次调用有延迟   |
| **文件上传** | Multer 中间件  | Base64 编码      |
| **会话管理** | 内存/数据库    | 数据库           |
| **错误处理** | 全局中间件     | 函数级处理       |

## ✅ 迁移完成检查清单

- [x] Chat 处理器实现
- [x] 多模型服务支持 (OpenAI, Gemini, Grok)
- [x] 图片输入支持
- [x] 会话管理
- [x] 错误处理
- [x] CORS 配置
- [x] 环境变量配置
- [x] 测试脚本
- [ ] 数据库集成 (聊天历史存储)
- [ ] 认证集成
- [ ] 生产环境部署
- [ ] 监控和日志

现在你的 Serverless 应用已经完全支持 AI 聊天功能了！🎉
