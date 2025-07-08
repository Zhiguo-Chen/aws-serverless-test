import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
let dbConnection: typeof mongoose | null = null;
export let mongoClientReady = false;
export const connectMongoDB = async () => {
  if (dbConnection && mongoose.connection.readyState === 1) {
    // If already connected and the state is normal, return the existing connection
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
    // In a production environment, you might want to retry or log more detailed errors
    process.exit(1); // Exit the process on connection failure
  }
};
