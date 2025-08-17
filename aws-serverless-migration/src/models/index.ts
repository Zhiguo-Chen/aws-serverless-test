import { Sequelize } from 'sequelize-typescript';
import sequelize from '../config/database';

// Export database instance
export { sequelize };

// Database connection test
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Sync database
export const syncDatabase = async (
  options: { force?: boolean; alter?: boolean } = {},
): Promise<void> => {
  try {
    const { force = false, alter = false } = options;

    console.log('Starting database synchronization...');

    await sequelize.sync({
      force,
      alter,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });

    console.log('Database synchronized successfully');
    console.log(`Total ${sequelize.models?.length} models synced`);

    if (force) {
      console.warn(
        '⚠️  Database tables were dropped and recreated (force: true)',
      );
    }
    if (alter) {
      console.log('📝 Database schema updated to match models (alter: true)');
    }
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

// Database health check
export const healthCheck = async (): Promise<{
  status: string;
  message: string;
}> => {
  try {
    await sequelize.authenticate();
    return { status: 'healthy', message: 'Database connection is active' };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
};

// Export all models
export { User } from './User.model';
export { Product } from './Product.model';
export { Category } from './Category.model';
export { ProductImage } from './ProductImage.model';
export { Review } from './Review.model';
export { CartItem } from './CartItem.model';
export { Order } from './Order.model';
export { OrderItem } from './OrderItem.model';

// Export the sequelize instance by default
export default sequelize;
