import { Sequelize } from 'sequelize-typescript';
import sequelize from '../config/database';

// 如果你的 database.ts 还是普通的 sequelize，需要升级为 sequelize-typescript
// 这里假设你已经升级了配置，如果没有，请参考下面的升级说明

// 导出数据库实例
export { sequelize };

// 数据库连接测试
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

// 同步数据库
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
    console.log(`Total ${sequelize.models.length} models synced`);

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

// 关闭数据库连接
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

// 数据库健康检查
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

// 获取数据库统计信息
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

    // 获取每个表的记录数（可选）
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

// 导出所有模型（如果需要的话）
// 这里可以导出你的具体模型，但通常通过 sequelize.models 访问就足够了
export * from './Category.model';
export * from './Product.model';
export * from './ProductImage.model';
export * from './Review.model';
export * from './User.model';

// 默认导出 sequelize 实例
export default sequelize;
