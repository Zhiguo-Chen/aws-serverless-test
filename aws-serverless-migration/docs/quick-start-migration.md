# 🚀 数据库迁移快速开始

将你的 `backup_file.dump` 迁移到 AWS RDS 的最简单方法。

## ⚡ 快速步骤

### 1. 准备工作（2 分钟）

```bash
# 确保备份文件存在
ls -lh backup_file.dump

# 检查必要工具
pg_restore --version
aws --version
```

### 2. 配置网络访问（1 分钟）

**获取你的公网 IP**:

```bash
curl ifconfig.me
```

**添加安全组规则**:

```bash
# 替换 YOUR_IP 为上面获取的 IP
aws ec2 authorize-security-group-ingress \
    --group-id sg-03174d2c2e890a3ed \
    --protocol tcp \
    --port 5432 \
    --cidr YOUR_IP/32 \
    --description "Temporary database migration access"
```

### 3. 执行迁移（5-30 分钟，取决于数据量）

```bash
# 使用自动化脚本
npm run db:restore

# 或者指定备份文件
npm run db:restore my_backup.dump
```

### 4. 验证结果（1 分钟）

```bash
# 测试数据库连接
curl "https://e9chpz10i2.execute-api.ap-northeast-1.amazonaws.com/dev/api/db-test"
```

### 5. 清理安全组（30 秒）

```bash
# 移除临时访问规则
aws ec2 revoke-security-group-ingress \
    --group-id sg-03174d2c2e890a3ed \
    --protocol tcp \
    --port 5432 \
    --cidr YOUR_IP/32
```

## ✅ 完成！

你的数据库现在已经迁移到 AWS RDS，并且可以通过 RDS Proxy 访问。

### 验证迁移成功的标志：

- ✅ 数据库连接测试返回成功
- ✅ 表和数据正确恢复
- ✅ Lambda 函数可以访问数据库
- ✅ API 端点正常响应

### 如果遇到问题：

1. 查看 [完整迁移指南](database-migration-guide.md)
2. 检查 [故障排除指南](connection-troubleshooting.md)
3. 确认所有环境变量配置正确

---

**总时间**: 约 10-40 分钟（取决于数据量）  
**难度**: 简单 ⭐⭐☆☆☆
