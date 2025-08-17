import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User.model';
import { Product } from '../models/Product.model';
import { Category } from '../models/Category.model';
import { ProductImage } from '../models/ProductImage.model';
import { Review } from '../models/Review.model';
import { CartItem } from '../models/CartItem.model';
import { Order } from '../models/Order.model';
import { OrderItem } from '../models/OrderItem.model';

// 显式导入 pg 以确保它被打包
import pg from 'pg';

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: pg, // 显式指定 pg 模块
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  models: [
    User,
    Product,
    Category,
    ProductImage,
    Review,
    CartItem,
    Order,
    OrderItem,
  ],
});

export default sequelize;
