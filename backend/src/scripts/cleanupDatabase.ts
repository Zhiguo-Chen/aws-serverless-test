import { ProductImage } from '../models/ProductImage.model';
import { testConnection } from '../models';
import { Op } from 'sequelize';

// 清理数据库中的无效图片记录
async function cleanupInvalidImageRecords() {
  console.log('🧹 开始清理数据库中的无效图片记录...');

  // 确保数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ 数据库连接失败，无法执行清理');
    return;
  }

  try {
    // 1. 查找所有无效记录
    const invalidRecords = await ProductImage.findAll({
      where: {
        [Op.or]: [
          { imageUrl: null },
          { imageUrl: '' },
          { imageUrl: { [Op.like]: '%undefined%' } },
          { imageUrl: { [Op.like]: '%null%' } },
        ],
      },
    });

    console.log(`找到 ${invalidRecords.length} 条无效记录`);

    if (invalidRecords.length === 0) {
      console.log('✅ 没有发现无效记录');
      return;
    }

    // 2. 显示无效记录详情
    console.log('\n📋 无效记录详情:');
    invalidRecords.forEach((record, index) => {
      console.log(
        `${index + 1}. ID: ${record.id}, URL: "${record.imageUrl}", Product: ${
          record.productId
        }`,
      );
    });

    // 3. 询问是否删除（在实际脚本中可以添加交互式确认）
    console.log('\n⚠️  这些记录将被删除，请确认...');

    // 删除无效记录
    const deletedCount = await ProductImage.destroy({
      where: {
        [Op.or]: [
          { imageUrl: null },
          { imageUrl: '' },
          { imageUrl: { [Op.like]: '%undefined%' } },
          { imageUrl: { [Op.like]: '%null%' } },
        ],
      },
    });

    console.log(`✅ 已删除 ${deletedCount} 条无效记录`);
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error);
  }
}

// 统计数据库中的图片记录
async function analyzeImageRecords() {
  console.log('📊 分析数据库中的图片记录...');

  try {
    const totalRecords = await ProductImage.count();
    const localRecords = await ProductImage.count({
      where: {
        imageUrl: { [Op.like]: '/uploads/%' },
      },
    });
    const azureRecords = await ProductImage.count({
      where: {
        imageUrl: { [Op.like]: '%blob.core.windows.net%' },
      },
    });
    const invalidRecords = await ProductImage.count({
      where: {
        [Op.or]: [
          { imageUrl: null },
          { imageUrl: '' },
          { imageUrl: { [Op.like]: '%undefined%' } },
          { imageUrl: { [Op.like]: '%null%' } },
        ],
      },
    });

    console.log('\n📈 统计结果:');
    console.log(`总记录数: ${totalRecords}`);
    console.log(`本地图片: ${localRecords}`);
    console.log(`Azure图片: ${azureRecords}`);
    console.log(`无效记录: ${invalidRecords}`);
    console.log(
      `其他记录: ${
        totalRecords - localRecords - azureRecords - invalidRecords
      }`,
    );
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'analyze':
      await analyzeImageRecords();
      break;
    case 'cleanup':
      await cleanupInvalidImageRecords();
      break;
    default:
      console.log('使用方法:');
      console.log('npm run cleanup:db analyze  # 分析数据库记录');
      console.log('npm run cleanup:db cleanup  # 清理无效记录');
  }

  process.exit(0);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { cleanupInvalidImageRecords, analyzeImageRecords };
