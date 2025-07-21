import fs from 'fs';
import path from 'path';
import { ProductImage } from '../models/ProductImage.model';
import { azureStorageService } from '../services/azureStorage';
import { Op } from 'sequelize';
import { testConnection } from '../models';

// 迁移本地图片到 Azure 的脚本
async function migrateLocalImagesToAzure() {
  console.log('开始迁移本地图片到 Azure Blob Storage...');

  // 确保数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ 数据库连接失败，无法执行迁移');
    return;
  }

  try {
    // 1. 获取所有需要迁移的图片记录
    const productImages = await ProductImage.findAll({
      where: {
        imageUrl: {
          [Op.like]: '/uploads/%',
        },
      },
    });

    console.log(`找到 ${productImages.length} 张需要迁移的图片`);

    let successCount = 0;
    let failCount = 0;

    // 2. 逐个迁移图片
    for (const imageRecord of productImages) {
      try {
        // 检查 imageUrl 是否存在
        if (!imageRecord.imageUrl) {
          console.warn(`⚠️  跳过空的图片URL记录: ID ${imageRecord.id}`);
          failCount++;
          continue;
        }

        const localPath = imageRecord.imageUrl.replace('/uploads/', '');
        const fullLocalPath = path.join(
          __dirname,
          '../../public/uploads',
          localPath,
        );

        // 检查本地文件是否存在
        if (!fs.existsSync(fullLocalPath)) {
          console.warn(`本地文件不存在: ${fullLocalPath}`);
          failCount++;
          continue;
        }

        // 读取本地文件
        const fileBuffer = fs.readFileSync(fullLocalPath);
        const fileName = path.basename(localPath);
        const mimeType = getMimeType(fileName);

        // 创建模拟的 Multer 文件对象
        const mockFile: Express.Multer.File = {
          fieldname: 'image',
          originalname: fileName,
          encoding: '7bit',
          mimetype: mimeType,
          size: fileBuffer.length,
          buffer: fileBuffer,
          destination: '',
          filename: fileName,
          path: '',
          stream: null as any,
        };

        // 上传到 Azure
        const uploadResult = await azureStorageService.uploadSingle(mockFile);

        // 更新数据库记录
        await imageRecord.update({
          imageUrl: uploadResult.url,
        });

        console.log(`✅ 成功迁移: ${fileName} -> ${uploadResult.url}`);
        successCount++;

        // 可选：删除本地文件（谨慎操作）
        // fs.unlinkSync(fullLocalPath);
      } catch (error) {
        console.error(
          `❌ 迁移失败: ID ${imageRecord.id}, URL: ${
            imageRecord.imageUrl || 'undefined'
          }`,
        );
        console.error(
          `   错误详情:`,
          error instanceof Error ? error.message : error,
        );
        failCount++;
      }
    }

    console.log('\n迁移完成！');
    console.log(`成功: ${successCount} 张`);
    console.log(`失败: ${failCount} 张`);

    if (successCount > 0) {
      console.log('\n⚠️  迁移成功后，请考虑：');
      console.log('1. 备份本地 uploads 文件夹');
      console.log('2. 更新应用路由使用 Azure 存储');
      console.log('3. 测试图片访问是否正常');
      console.log('4. 确认无误后删除本地 uploads 文件夹');
    }
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
  }
}

// 根据文件扩展名获取 MIME 类型
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 清理本地上传文件夹（可选）
async function cleanupLocalUploads() {
  const uploadsDir = path.join(__dirname, '../../public/uploads');

  if (fs.existsSync(uploadsDir)) {
    console.log('清理本地上传文件夹...');

    // 创建备份
    const backupDir = path.join(__dirname, '../../uploads-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 移动文件到备份目录
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const srcPath = path.join(uploadsDir, file);
      const destPath = path.join(backupDir, file);
      fs.renameSync(srcPath, destPath);
    }

    console.log(`文件已备份到: ${backupDir}`);

    // 删除空的 uploads 目录
    fs.rmdirSync(uploadsDir);
    console.log('本地 uploads 目录已清理');
  }
}

// 验证迁移结果
async function verifyMigration() {
  console.log('验证迁移结果...');

  const productImages = await ProductImage.findAll();
  let azureCount = 0;
  let localCount = 0;

  for (const image of productImages) {
    if (image.imageUrl.includes('blob.core.windows.net')) {
      azureCount++;
    } else if (image.imageUrl.startsWith('/uploads/')) {
      localCount++;
    }
  }

  console.log(`Azure 图片: ${azureCount} 张`);
  console.log(`本地图片: ${localCount} 张`);

  if (localCount === 0) {
    console.log('✅ 所有图片已成功迁移到 Azure！');
  } else {
    console.log('⚠️  仍有图片未迁移，请检查迁移日志');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'migrate':
      await migrateLocalImagesToAzure();
      break;
    case 'verify':
      await verifyMigration();
      break;
    case 'cleanup':
      await cleanupLocalUploads();
      break;
    default:
      console.log('使用方法:');
      console.log('npm run migrate:azure migrate  # 迁移图片到 Azure');
      console.log('npm run migrate:azure verify   # 验证迁移结果');
      console.log('npm run migrate:azure cleanup  # 清理本地文件');
  }

  process.exit(0);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { migrateLocalImagesToAzure, verifyMigration, cleanupLocalUploads };
