const express = require('express');
const route = require('./routes/routes');
const sequelize = require('./config/database');
const db = require('./models');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', route);

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('数据库连接成功.');

    // 同步所有模型
    // 注意: 在生产环境中，你应该使用迁移而不是 sync()
    await db.sequelize.sync({ force: false }); // force: true 会删除现有表
    console.log('数据库表已创建/更新.');
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
