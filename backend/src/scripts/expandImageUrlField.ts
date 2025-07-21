import { QueryInterface, DataTypes } from 'sequelize';
import { testConnection } from '../models';

// 扩展 imageUrl 字段长度的脚本
async function expandImageUrlField() {
  console.log('🔧 开始扩展 imageUrl 字段长度...');

  // 确保数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ 数据库连接失败');
    return;
  }

  try {
    // 获取 Sequelize 实例
    const { sequelize } = require('../models');
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    // 修改 product_images 表的 imageUrl 字段
    await queryInterface.changeColumn('product_images', 'imageUrl', {
      type: DataTypes.TEXT, // 改为 TEXT 类型，支持更长的 URL
      allowNull: false,
    });

    console.log('✅ imageUrl 字段已成功扩展为 TEXT 类型');

    // 验证修改结果
    const tableDescription = await queryInterface.describeTable(
      'product_images',
    );
    console.log('📋 imageUrl 字段信息:', tableDescription.imageUrl);
  } catch (error) {
    console.error('❌ 扩展字段失败:', error);
  }
}

// 主函数
async function main() {
  await expandImageUrlField();
  process.exit(0);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { expandImageUrlField };
