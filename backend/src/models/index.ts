import { Sequelize } from 'sequelize-typescript';
import sequelize from '../config/database';

// If your database.ts is still plain sequelize, you need to upgrade to sequelize-typescript
// It is assumed here that you have upgraded the configuration, if not, please refer to the upgrade instructions below

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
      logging: process.env.NODEENV === 'development' ? console.log : false,
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

// Get database statistics
export const getStats = async (): Promise<any> => {
  try {
    const modelNames = Object.keys(sequelize.models);
    const stats: any = {
      totalModels: modelNames.length,
      models: modelNames,
      connectionConfig: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'database',
        dialect: 'postgres',
      },
    };

    // Get the number of records for each table (optional)
    if (process.env.INCLUDE_TABLE_COUNTS === 'true') {
      stats.tableCounts = {};
      for (const modelName of modelNames) {
        try {
          const model = sequelize.models[modelName];
          const count = await model.count();
          stats.tableCounts[modelName] = count;
        } catch (error) {
          stats.tableCounts[modelName] = 'Error getting count';
        }
      }
    }

    return stats;
  } catch (error) {
    throw new Error(
      `Failed to get database stats: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

// Export all models (if needed)
// You can export your specific models here, but usually accessing them through sequelize.models is sufficient
export { Category } from './Category.model';
export { Product } from './Product.model';
export { ProductImage } from './ProductImage.model';
export { Review } from './Review.model';
export { User } from './User.model';

// Export the sequelize instance by default
export default sequelize;
