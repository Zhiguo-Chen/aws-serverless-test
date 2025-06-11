import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import db, { loadModels } from './models/index.js';
import { connectMongoDB } from './config/mongodb.js';

// 导入路由
import productRoutes from './routes/productRoutes.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const app = express();

app.use('/public', express.static(publicDir));

// 中间件
const corsOptions = {
  // 在这里放入您所有前端应用的URL
  origin: [
    'https://my-demo.camdvr.org',
    'https://icy-sky-08145be00.6.azurestaticapps.net',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],
  // 明确允许所有标准的HTTP方法
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // 允许前端在请求头中携带 'Content-Type' 和 'Authorization' 等字段
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 响应预检请求时，返回200状态码，确保兼容性
  optionsSuccessStatus: 200,
};

// 2. 将带有详细选项的配置应用到CORS中间件
app.use(cors(corsOptions));

// 3. 继续使用其他中间件
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api', productRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动函数
const PORT = process.env.PORT || 4000;
const start = async () => {
  try {
    console.log('Starting application initialization...');

    // 1. 加载模型
    await loadModels();
    console.log('Models loaded successfully');

    // 2. 连接 MongoDB
    await connectMongoDB();
    console.log('MongoDB connected successfully');

    // 3. 同步数据库
    await db.sequelize.sync({ force: false });
    console.log('Database synced successfully');

    // 4. 初始化聊天历史链（在 MongoDB 连接之后）
    try {
      await initializeChatHistoryChain();
      console.log('Chat history chain initialized successfully');
    } catch (chatError) {
      console.error('Failed to initialize chat history chain:', chatError);
      // 不要因为聊天功能失败而停止整个应用
      console.log('Continuing without chat history functionality...');
    }

    // 5. 启动服务器
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Application startup completed successfully');
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
};

start();
