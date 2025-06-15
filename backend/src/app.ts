import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { testConnection, syncDatabase, closeConnection } from './models';
import { connectMongoDB } from './config/mongodb';

// 导入路由
import productRoutes from './routes/productRoutes';

// const __dirname = path.dirname(new URL(import.meta.url).pathname);
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
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  },
);

// 启动函数
const PORT = process.env.PORT || 4000;
const start = async () => {
  try {
    console.log('Starting application initialization...');

    // 1. 测试数据库连接（模型已自动加载）
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // 2. 连接 MongoDB
    await connectMongoDB();
    console.log('MongoDB connected successfully');

    // 3. 同步数据库
    await syncDatabase({
      force:
        process.env.NODEENV === 'development' &&
        process.env.DB_FORCE_SYNC === 'true',
      alter:
        process.env.NODEENV === 'development' &&
        process.env.DB_ALTER_SYNC === 'true',
    });
    console.log('Database synced successfully');

    // 4. 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Application startup completed successfully');
    });

    // 优雅关闭处理
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      await closeConnection();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      await closeConnection();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    await closeConnection();
    process.exit(1);
  }
};

start();
