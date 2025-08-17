# 数据库迁移指南

将本地 PostgreSQL 数据库迁移到 AWS RDS 的完整指南。

## 🎯 迁移概述

### 迁移流程

1. **准备工作** - 检查工具和权限
2. **配置安全组** - 允许本地 IP 访问 RDS
3. **执行恢复** - 将备份文件恢复到 RDS
4. **验证数据** - 确认迁移成功
5. **测试应用** - 验证应用程序连接

### 重要注意事项

- ⚠️ **数据覆盖**: 恢复过程会覆盖目标数据库中的现有数据
- 🔒 **网络访问**: 需要临时开放 RDS 的网络访问权限
- ⏱️ **时间估算**: 根据数据量，恢复可能需要几分钟到几小时

## 📋 准备工作

### 1. 检查必要工具

确保已安装以下工具：

```bash
# 检查 PostgreSQL 客户端工具
pg_restore --version

# 检查 AWS CLI
aws --version

# 如果未安装，请安装：
# macOS
brew install postgresql awscli

# Ubuntu/Debian
sudo apt-get install postgresql-client awscli
```

### 2. 配置 AWS 凭据

```bash
# 配置 AWS CLI（如果尚未配置）
aws configure

# 验证配置
aws sts get-caller-identity
```

### 3. 检查备份文件

确认你的备份文件存在且格式正确：

```bash
# 检查备份文件
ls -lh backup_file.dump

# 如果需要创建新的备份（从本地数据库）
pg_dump -h localhost -U postgres -d your_database -Fc -f backup_file.dump
```

## 🔧 配置 AWS 安全组

### 方法 1: 通过 AWS 控制台

1. 进入 **EC2 控制台** → **Security Groups**
2. 找到安全组 `sg-03174d2c2e890a3ed`
3. 点击 **Edit inbound rules**
4. 添加新规则：
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: My IP (会自动填入你的公网 IP)
   - **Description**: Temporary access for database migration

### 方法 2: 通过 AWS CLI

```bash
# 获取你的公网 IP
MY_IP=$(curl -s ifconfig.me)

# 添加安全组规则
aws ec2 authorize-security-group-ingress \
    --group-id sg-03174d2c2e890a3ed \
    --protocol tcp \
    --port 5432 \
    --cidr ${MY_IP}/32 \
    --description "Temporary access for database migration"
```

## 🚀 执行数据库恢复

### 方法 1: 使用自动化脚本（推荐）

```bash
# 使用 Node.js 脚本
node scripts/restore-database.js backup_file.dump

# 或使用 Bash 脚本
./scripts/restore-database.sh backup_file.dump
```

### 方法 2: 手动执行

```bash
# 1. 获取 RDS 端点
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier myapp-postgres \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "RDS 端点: $RDS_ENDPOINT"

# 2. 测试连接
export PGPASSWORD=Welcome321
pg_isready -h $RDS_ENDPOINT -p 5432 -U postgres

# 3. 创建数据库（如果不存在）
psql -h $RDS_ENDPOINT -p 5432 -U postgres -d postgres -c "CREATE DATABASE postgres;"

# 4. 恢复数据库
pg_restore \
    --host=$RDS_ENDPOINT \
    --port=5432 \
    --username=postgres \
    --dbname=postgres \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    backup_file.dump
```

## 🔍 验证迁移结果

### 1. 检查表结构

```bash
# 连接到 RDS 并列出所有表
export PGPASSWORD=Welcome321
psql -h $RDS_ENDPOINT -p 5432 -U postgres -d postgres -c "\dt"
```

### 2. 验证数据量

```bash
# 检查主要表的记录数
psql -h $RDS_ENDPOINT -p 5432 -U postgres -d postgres -c "
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserted_rows,
    n_tup_upd as updated_rows,
    n_tup_del as deleted_rows
FROM pg_stat_user_tables
ORDER BY n_tup_ins DESC;
"
```

### 3. 测试应用程序连接

```bash
# 测试 Lambda 函数的数据库连接
curl "https://e9chpz10i2.execute-api.ap-northeast-1.amazonaws.com/dev/api/db-test"

# 测试产品 API（如果有数据）
curl "https://e9chpz10i2.execute-api.ap-northeast-1.amazonaws.com/dev/api/products"
```

## 🔒 清理安全组配置

**重要**: 迁移完成后，立即移除临时的安全组规则：

### 通过 AWS 控制台

1. 进入 **EC2 控制台** → **Security Groups**
2. 找到安全组 `sg-03174d2c2e890a3ed`
3. 删除刚才添加的临时规则

### 通过 AWS CLI

```bash
# 获取你的公网 IP
MY_IP=$(curl -s ifconfig.me)

# 移除安全组规则
aws ec2 revoke-security-group-ingress \
    --group-id sg-03174d2c2e890a3ed \
    --protocol tcp \
    --port 5432 \
    --cidr ${MY_IP}/32
```

## 📊 常见问题排除

### 问题 1: 连接超时

```
Error: Connection timed out
```

**解决方案**:

- 检查安全组配置是否正确
- 确认你的公网 IP 地址
- 验证 RDS 实例状态为 "available"

### 问题 2: 认证失败

```
Error: authentication failed
```

**解决方案**:

- 检查数据库用户名和密码
- 确认 RDS 实例的主用户名
- 验证环境变量配置

### 问题 3: 数据库不存在

```
Error: database "xxx" does not exist
```

**解决方案**:

- 先连接到 `postgres` 数据库
- 创建目标数据库
- 然后再执行恢复

### 问题 4: 权限错误

```
Error: permission denied
```

**解决方案**:

- 使用 `--no-owner --no-privileges` 参数
- 确保目标用户有足够权限
- 检查 RDS 参数组配置

## 🎯 最佳实践

### 1. 备份策略

- 在迁移前创建 RDS 快照
- 保留本地备份文件
- 验证备份文件完整性

### 2. 安全考虑

- 使用最小权限原则
- 及时清理临时访问规则
- 考虑使用 VPN 或堡垒机

### 3. 性能优化

- 在低峰时段执行迁移
- 考虑分批迁移大表
- 监控 RDS 性能指标

### 4. 测试验证

- 全面测试应用功能
- 验证数据完整性
- 检查索引和约束

## 📝 迁移检查清单

- [ ] 安装必要工具 (pg_restore, aws cli)
- [ ] 配置 AWS 凭据
- [ ] 检查备份文件存在且完整
- [ ] 配置安全组允许访问
- [ ] 测试 RDS 连接
- [ ] 执行数据库恢复
- [ ] 验证表结构和数据
- [ ] 测试应用程序连接
- [ ] 清理临时安全组规则
- [ ] 创建 RDS 快照备份
- [ ] 更新应用程序配置
- [ ] 执行完整的应用测试

## 🆘 获取帮助

如果遇到问题：

1. **查看详细日志**: 恢复脚本会显示详细的错误信息
2. **检查 AWS 状态**: 确认 RDS 实例和网络配置
3. **验证权限**: 确保 AWS 用户有足够的权限
4. **联系支持**: 如果问题持续，可以联系 AWS 支持

---

**注意**: 这个迁移过程会直接操作生产数据库，请务必在执行前做好充分的备份和测试。
