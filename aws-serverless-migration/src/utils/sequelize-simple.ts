import { Sequelize, DataTypes, Model } from 'sequelize';
// 显式导入 pg 以确保它被打包
import pg from 'pg';

let sequelize: Sequelize | null = null;

// 简化的 Sequelize 连接
export const getSequelize = async (): Promise<Sequelize> => {
  if (!sequelize) {
    console.log('Creating Sequelize connection...');

    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: pg, // 显式指定 pg 模块
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialectOptions: {
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
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
      console.log('✅ Sequelize connected successfully');
    } catch (error) {
      console.error('❌ Sequelize connection failed:', error);
      throw error;
    }
  }

  return sequelize;
};

// 产品和分类模型定义，匹配实际数据库表结构
export const defineModels = (sequelize: Sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      discountPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'stockQuantity', // 映射到数据库字段
      },
      stock: {
        type: DataTypes.VIRTUAL, // 虚拟字段，用于兼容
        get() {
          return this.getDataValue('stockQuantity');
        },
        set(value: number) {
          this.setDataValue('stockQuantity', value);
        },
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isNewArrival: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isHotSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isFlashSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      flashSaleEndsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'products', // 使用小写表名
      timestamps: true,
      underscored: false, // 保持驼峰命名
    },
  );

  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'categories', // 使用小写表名
      timestamps: true,
      underscored: false,
    },
  );

  // 定义关联
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

  return { Product, Category };
};

// 获取模型
export const getModels = async () => {
  const sequelize = await getSequelize();
  return defineModels(sequelize);
};
