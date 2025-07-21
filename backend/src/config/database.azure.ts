import { Sequelize } from 'sequelize-typescript';
import { Product } from '../models/Product.model';
import { ProductImage } from '../models/ProductImage.model';
import { Category } from '../models/Category.model';
import { User } from '../models/User.model';
import { Cart } from '../models/Cart.model';
import { CartItem } from '../models/CartItem.model';
import { Wishlist } from '../models/Wishlist.model';
import { Review } from '../models/Review.model';

// 数据库环境配置
const isAzure = process.env.DB_ENVIRONMENT === 'azure';
const isDevelopment = process.env.NODE_ENV === 'development';

// 数据库连接配置
const dbConfig = {
  host: isAzure
    ? process.env.DB_HOST
    : process.env.DB_HOST_LOCAL || 'localhost',
  username: isAzure
    ? process.env.DB_USER
    : process.env.DB_USER_LOCAL || 'postgres',
  password: isAzure ? process.env.DB_PASSWORD : process.env.DB_PASSWORD_LOCAL,
  database: isAzure
    ? process.env.DB_NAME
    : process.env.DB_NAME_LOCAL || 'E-Commerce',
  port: parseInt(
    isAzure
      ? process.env.DB_PORT || '5432'
      : process.env.DB_PORT_LOCAL || '5432',
  ),
  dialect: 'postgres' as const,

  // SSL 配置 - Azure 需要 SSL
  dialectOptions: isAzure
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},

  // 连接池配置
  pool: {
    max: isAzure ? 20 : 5, // Azure 环境使用更大的连接池
    min: isAzure ? 5 : 0, // Azure 环境保持最小连接数
    acquire: 30000, // 获取连接的最大时间
    idle: 10000, // 连接空闲时间
  },

  // 日志配置
  logging: isDevelopment ? console.log : false,

  // 时区设置
  timezone: '+00:00',

  // 查询配置
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },

  // Azure 特定配置
  ...(isAzure && {
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ENOTFOUND/,
        /EAI_AGAIN/,
      ],
    },
  }),
};

// 创建 Sequelize 实例
export const sequelize = new Sequelize(dbConfig);

// 注册模型
sequelize.addModels([
  Product,
  ProductImage,
  Category,
  User,
  Cart,
  CartItem,
  Wishlist,
  Review,
]);

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log(`✅ 数据库连接成功 (${isAzure ? 'Azure' : '本地'})`);
    console.log(`📍 主机: ${dbConfig.host}`);
    console.log(`🗄️  数据库: ${dbConfig.database}`);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 同步数据库
export async function syncDatabase(
  options: { force?: boolean; alter?: boolean } = {},
): Promise<void> {
  try {
    await sequelize.sync(options);
    console.log('✅ 数据库同步成功');
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    throw error;
  }
}

// 关闭数据库连接
export async function closeConnection(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
}

// 获取数据库信息
export function getDatabaseInfo() {
  return {
    environment: isAzure ? 'Azure' : '本地',
    host: dbConfig.host,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: !!dbConfig.dialectOptions?.ssl,
  };
}

// 健康检查
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  database: string;
  environment: string;
  uptime?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const uptime = Date.now() - startTime;

    return {
      status: 'healthy',
      database: dbConfig.database || 'unknown',
      environment: isAzure ? 'Azure' : '本地',
      uptime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: dbConfig.database || 'unknown',
      environment: isAzure ? 'Azure' : '本地',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default sequelize;
