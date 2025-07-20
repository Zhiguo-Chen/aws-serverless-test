#!/usr/bin/env node

// 简化的迁移执行脚本
require('dotenv').config();
const { execSync } = require('child_process');

console.log('🚀 开始执行 Azure 迁移...');
console.log('📋 当前配置:');
console.log(`   存储账户: ${process.env.AZURE_STORAGE_ACCOUNT_NAME}`);
console.log(
  `   容器名称: ${
    process.env.AZURE_STORAGE_CONTAINER_NAME || 'product-images'
  }`,
);
console.log(`   使用SAS: ${process.env.AZURE_USE_SAS_URLS}`);

try {
  // 执行迁移脚本
  execSync('npx ts-node src/scripts/migrateToAzure.ts migrate', {
    stdio: 'inherit',
    cwd: __dirname,
  });

  console.log('\n✅ 迁移完成！');
  console.log('\n📝 下一步操作:');
  console.log('1. 验证迁移结果: npm run migrate:azure verify');
  console.log('2. 测试图片访问是否正常');
  console.log('3. 备份本地文件: npm run migrate:azure cleanup');
} catch (error) {
  console.error('❌ 迁移失败:', error.message);
  process.exit(1);
}
