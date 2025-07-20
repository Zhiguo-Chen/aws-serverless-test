import { ProductImage } from '../models/ProductImage.model';
import { testConnection } from '../models';
import { Op } from 'sequelize';

// 调试数据库中的图片记录
async function debugImageRecords() {
  console.log('🔍 调试数据库中的图片记录...');

  // 确保数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ 数据库连接失败');
    return;
  }

  try {
    // 1. 查看所有记录的详细信息
    const allRecords = await ProductImage.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
    });

    console.log('\n📋 最近的10条记录详情:');
    allRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   imageUrl: "${record.imageUrl}"`);
      console.log(`   imageUrl type: ${typeof record.imageUrl}`);
      console.log(
        `   imageUrl length: ${
          record.imageUrl ? record.imageUrl.length : 'null'
        }`,
      );
      console.log(`   productId: ${record.productId}`);
      console.log(`   isPrimary: ${record.isPrimary}`);
      console.log(`   altText: "${record.altText}"`);
      console.log('   ---');
    });

    // 2. 查找真正的本地图片记录
    const localRecords = await ProductImage.findAll({
      where: {
        imageUrl: { [Op.like]: '/uploads/%' },
      },
      limit: 5,
    });

    console.log(`\n📁 本地图片记录 (${localRecords.length} 条):`);
    localRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, URL: "${record.imageUrl}"`);
    });

    // 3. 查找 Azure 图片记录
    const azureRecords = await ProductImage.findAll({
      where: {
        imageUrl: { [Op.like]: '%blob.core.windows.net%' },
      },
      limit: 5,
    });

    console.log(`\n☁️  Azure 图片记录 (${azureRecords.length} 条):`);
    azureRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, URL: "${record.imageUrl}"`);
    });

    // 4. 查找空记录
    const emptyRecords = await ProductImage.findAll({
      where: {
        [Op.or]: [{ imageUrl: null }, { imageUrl: '' }],
      },
      limit: 5,
    });

    console.log(`\n🚫 空记录 (${emptyRecords.length} 条):`);
    emptyRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, URL: "${record.imageUrl}"`);
    });
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 主函数
async function main() {
  await debugImageRecords();
  process.exit(0);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { debugImageRecords };
