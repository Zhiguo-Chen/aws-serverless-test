import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import db, { loadModels } from './models/index.js';

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
app.use(cors());
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

// 数据库同步
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Database sync error:', err);
  });

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动函数
const PORT = process.env.PORT || 4000;
const start = async () => {
  await loadModels();
  db.sequelize
    .sync({ force: false })
    .then(() => {
      console.log('Database synced');
    })
    .catch((err) => {
      console.error('Database sync error:', err);
    });

  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
