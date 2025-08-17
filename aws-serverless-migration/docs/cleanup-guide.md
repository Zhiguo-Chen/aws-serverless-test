# 🧹 迁移后清理指南

数据库迁移已经完成，现在需要清理临时的迁移相关代码，保持生产环境的简洁性。

## 🎯 清理目标

移除所有**一次性使用**的迁移相关组件：

- 临时的 Lambda 函数
- 迁移脚本
- 临时的 SQL 文件
- 测试和调试用的配置

## 📋 需要删除的文件

### Lambda 函数 (临时)

- ❌ `src/handlers/db-restore.ts` - 数据库恢复函数
- ❌ `src/handlers/db-test.ts` - 数据库连接测试函数

### 迁移脚本 (临时)

- ❌ `scripts/restore-database.js` - Node.js 恢复脚本
- ❌ `scripts/restore-database.sh` - Bash 恢复脚本
- ❌ `scripts/restore-via-api.js` - API 恢复脚本
- ❌ `scripts/simple-restore.js` - 简单恢复脚本

### SQL 文件 (临时)

- ❌ `backup_restore.sql` - 从 dump 转换的 SQL
- ❌ `tables_only.sql` - 只包含表结构的 SQL
- ❌ `clean_backup.sql` - 清理后的 SQL

### 配置文件 (临时)

- ❌ `serverless-minimal.yml` - 临时的简化配置

### Package.json 脚本 (临时)

- ❌ `"db:restore"` - 数据库恢复脚本
- ❌ `"db:restore-bash"` - Bash 恢复脚本
- ❌ `"db:migrate"` - 迁移脚本
- ❌ `"db:test"` - 数据库测试脚本
- ❌ `"db:test-local"` - 本地测试脚本

## ✅ 需要保留的文件

### 重要文件 (保留)

- ✅ `backup_file.dump` - 原始备份文件 (以备将来需要)
- ✅ `docs/` - 所有文档 (包含迁移记录)
- ✅ `serverless-production.yml` - 生产环境配置

### 核心应用文件 (保留)

- ✅ `src/handlers/auth.ts` - 认证功能
- ✅ `src/handlers/products.ts` - 产品功能
- ✅ `src/handlers/health.ts` - 健康检查
- ✅ 所有其他业务逻辑文件

## 🚀 自动清理

### 方法 1: 使用清理脚本 (推荐)

```bash
# 运行自动清理脚本
./scripts/cleanup-migration.sh
```

这个脚本会：

1. 删除所有临时文件
2. 清理 package.json 中的临时脚本
3. 更新 serverless.yml 为生产版本
4. 创建备份文件

### 方法 2: 手动清理

如果你想手动控制清理过程：

```bash
# 1. 删除临时 Lambda 函数
rm src/handlers/db-restore.ts
rm src/handlers/db-test.ts

# 2. 删除迁移脚本
rm scripts/restore-*.js
rm scripts/restore-*.sh

# 3. 删除临时 SQL 文件
rm backup_restore.sql tables_only.sql clean_backup.sql

# 4. 使用生产配置
cp serverless-production.yml serverless.yml
rm serverless-minimal.yml

# 5. 手动编辑 package.json 移除临时脚本
```

## 📝 清理后的 serverless.yml

清理后的配置将包含：

```yaml
functions:
  # 核心功能
  health: # 健康检查
  login: # 用户登录
  register: # 用户注册

  # 业务功能
  getProducts: # 获取产品
  createProduct: # 创建产品
  getCategories: # 获取分类
  # ... 其他业务功能

  # 移除的临时功能
  # dbTest:         # ❌ 数据库测试
  # dbRestore:      # ❌ 数据库恢复
  # dbBackupInfo:   # ❌ 备份信息
```

## 🔄 重新部署

清理完成后，重新部署应用：

```bash
# 部署清理后的版本
serverless deploy --stage dev

# 验证部署成功
curl https://your-api-url/health
```

## ✅ 验证清理结果

### 检查 Lambda 函数

```bash
# 列出部署的函数
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `ecommerce-serverless`)].FunctionName'

# 应该不再包含 dbTest, dbRestore, dbBackupInfo
```

### 检查 API 端点

```bash
# 这些端点应该返回 404
curl https://your-api-url/api/db-test          # ❌ 应该 404
curl https://your-api-url/api/db-restore       # ❌ 应该 404
curl https://your-api-url/api/db-backup-info   # ❌ 应该 404

# 这些端点应该正常工作
curl https://your-api-url/health               # ✅ 应该正常
curl https://your-api-url/api/products         # ✅ 应该正常
```

## 📊 清理前后对比

| 项目            | 清理前       | 清理后       |
| --------------- | ------------ | ------------ |
| Lambda 函数数量 | 8 个         | 5 个         |
| 包大小          | ~2.3 MB      | ~2.0 MB      |
| 部署时间        | ~70 秒       | ~50 秒       |
| API 端点        | 包含调试端点 | 只有业务端点 |

## 🎯 清理的好处

1. **安全性提升** - 移除了调试和管理端点
2. **性能优化** - 减少了不必要的函数
3. **维护简化** - 代码更简洁，易于维护
4. **成本降低** - 减少了 Lambda 函数数量

## 🔒 安全考虑

清理后的应用：

- ❌ 不再暴露数据库管理端点
- ❌ 不再包含调试功能
- ✅ 只保留必要的业务功能
- ✅ 符合生产环境安全标准

## 📚 备份和恢复

如果将来需要重新迁移：

1. **查看文档**: `docs/migration-success-report.md`
2. **使用原始备份**: `backup_file.dump`
3. **参考迁移指南**: `docs/database-migration-guide.md`

## 🎉 完成

清理完成后，你的应用将：

- 🚀 更快的部署速度
- 🔒 更高的安全性
- 🧹 更简洁的代码结构
- 💰 更低的运行成本

数据库迁移的任务已经完成，现在可以专注于业务功能的开发了！
