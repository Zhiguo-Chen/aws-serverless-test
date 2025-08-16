// 真实数据库连接工具
import { Pool, PoolClient } from 'pg';
import { MongoClient, Db } from 'mongodb';
import { Sequelize } from 'sequelize-typescript';
import { Product } from '../models/Product.model';
import { Category } from '../models/Category.model';
import { User } from '../models/User.model';

// PostgreSQL 连接池
let pgPool: Pool | null = null;

// MongoDB 连接
let mongoClient: MongoClient | null = null;
let mongoDB: Db | null = null;

// Sequelize 实例
let sequelize: Sequelize | null = null;

// PostgreSQL 连接
export const getDBConnection = async (): Promise<Pool> => {
  if (!pgPool) {
    console.log('Creating new PostgreSQL connection pool...');
    pgPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // 测试连接
    try {
      const client = await pgPool.connect();
      console.log('PostgreSQL connected successfully');
      client.release();
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      throw error;
    }
  }

  return pgPool;
};

// MongoDB 连接
export const getMongoConnection = async (): Promise<Db> => {
  if (!mongoDB) {
    console.log('Creating new MongoDB connection...');

    const mongoUri = process.env.MONGODB_URI || process.env.SERVER_MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDB = mongoClient.db();

    console.log('MongoDB connected successfully');
  }

  return mongoDB;
};

// Sequelize 连接
export const getSequelizeInstance = async (): Promise<Sequelize> => {
  if (!sequelize) {
    console.log('Creating new Sequelize instance...');

    sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialectOptions: {
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
      models: [Product, Category, User],
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    try {
      await sequelize.authenticate();
      console.log('Sequelize connected successfully');
    } catch (error) {
      console.error('Sequelize connection failed:', error);
      throw error;
    }
  }

  return sequelize;
};

// 通用数据库连接函数
export const connectToDatabase = async () => {
  try {
    await getDBConnection();
    await getMongoConnection();
    await getSequelizeInstance();
    console.log('All databases connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// 关闭连接
export const closeConnection = async () => {
  try {
    if (sequelize) {
      await sequelize.close();
      sequelize = null;
      console.log('Sequelize connection closed');
    }

    if (pgPool) {
      await pgPool.end();
      pgPool = null;
      console.log('PostgreSQL connection closed');
    }

    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
      mongoDB = null;
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};

// PostgreSQL 查询辅助函数
export const queryPostgreSQL = async (
  query: string,
  params: any[] = [],
): Promise<any[]> => {
  const pool = await getDBConnection();
  const client = await pool.connect();

  try {
    console.log('Executing PostgreSQL query:', query, params);
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// MongoDB 查询辅助函数
export const queryMongoDB = async (
  collection: string,
  operation: string,
  query: any = {},
  options: any = {},
): Promise<any> => {
  const db = await getMongoConnection();
  const coll = db.collection(collection);

  console.log(`Executing MongoDB ${operation} on ${collection}:`, query);

  switch (operation) {
    case 'find':
      return await coll.find(query, options).toArray();
    case 'findOne':
      return await coll.findOne(query, options);
    case 'insertOne':
      return await coll.insertOne(query);
    case 'insertMany':
      return await coll.insertMany(query);
    case 'updateOne':
      return await coll.updateOne(query, options);
    case 'updateMany':
      return await coll.updateMany(query, options);
    case 'deleteOne':
      return await coll.deleteOne(query);
    case 'deleteMany':
      return await coll.deleteMany(query);
    case 'countDocuments':
      return await coll.countDocuments(query);
    default:
      throw new Error(`Unsupported MongoDB operation: ${operation}`);
  }
};
