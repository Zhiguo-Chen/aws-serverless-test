import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
let dbConnection: typeof mongoose | null = null;
export let mongoClientReady = false;
export const connectMongoDB = async () => {
  if (dbConnection && mongoose.connection.readyState === 1) {
    // 如果已经连接且状态正常，则直接返回现有连接
    console.log('Already connected to MongoDB.');
    mongoClientReady = true;
    return dbConnection;
  }
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in your .env file.');
  }
  try {
    console.log('Connecting to MongoDB...');
    dbConnection = await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');
    mongoClientReady = true;
    return dbConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // 在生产环境中，你可能希望重试或记录更详细的错误
    process.exit(1); // 连接失败时退出进程
  }
};
