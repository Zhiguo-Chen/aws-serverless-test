const express = require('express');
const route = require('./route/routes');
const sequelize = require('./config/database');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', route);

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    app.listen(4000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
