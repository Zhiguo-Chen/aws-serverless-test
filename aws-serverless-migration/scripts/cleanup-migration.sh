#!/bin/bash

# 数据库迁移清理脚本
# 移除所有临时的迁移相关文件和配置

set -e

echo "🧹 开始清理数据库迁移相关的临时文件..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 将要删除的文件和配置:${NC}"
echo "1. 临时迁移脚本"
echo "2. 数据库恢复 Lambda 函数"
echo "3. 临时 SQL 文件"
echo "4. 迁移相关的 package.json 脚本"
echo "5. 临时的 serverless 配置"
echo ""

echo -e "${YELLOW}⚠️  注意: 这将删除以下内容:${NC}"
echo "- src/handlers/db-restore.ts"
echo "- src/handlers/db-test.ts"
echo "- scripts/restore-*.js"
echo "- scripts/restore-*.sh"
echo "- backup_restore.sql, tables_only.sql, clean_backup.sql"
echo "- serverless-minimal.yml"
echo ""

read -p "确认删除这些临时文件? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

echo -e "${BLUE}🗑️  删除临时 Lambda 函数...${NC}"
if [ -f "src/handlers/db-restore.ts" ]; then
    rm src/handlers/db-restore.ts
    echo "✅ 删除 db-restore.ts"
fi

if [ -f "src/handlers/db-test.ts" ]; then
    rm src/handlers/db-test.ts
    echo "✅ 删除 db-test.ts"
fi

echo -e "${BLUE}🗑️  删除迁移脚本...${NC}"
rm -f scripts/restore-*.js
rm -f scripts/restore-*.sh
rm -f scripts/simple-restore.js
echo "✅ 删除所有迁移脚本"

echo -e "${BLUE}🗑️  删除临时 SQL 文件...${NC}"
rm -f backup_restore.sql
rm -f tables_only.sql
rm -f clean_backup.sql
echo "✅ 删除临时 SQL 文件"

echo -e "${BLUE}🗑️  删除临时 serverless 配置...${NC}"
if [ -f "serverless-minimal.yml" ]; then
    rm serverless-minimal.yml
    echo "✅ 删除 serverless-minimal.yml"
fi

echo -e "${BLUE}📝 更新 package.json...${NC}"
# 备份 package.json
cp package.json package.json.backup

# 移除迁移相关的脚本
if command -v jq &> /dev/null; then
    jq 'del(.scripts["db:restore"], .scripts["db:restore-bash"], .scripts["db:migrate"], .scripts["db:test"], .scripts["db:test-local"])' package.json > package.json.tmp
    mv package.json.tmp package.json
    echo "✅ 从 package.json 移除迁移脚本"
else
    echo "⚠️  请手动从 package.json 中移除以下脚本:"
    echo '   "db:restore", "db:restore-bash", "db:migrate", "db:test", "db:test-local"'
fi

echo -e "${BLUE}📋 更新 .env 文件...${NC}"
# 备份 .env
cp .env .env.backup

# 移除迁移相关的环境变量
sed -i.bak '/# VPC 配置/d' .env
sed -i.bak '/SECURITY_GROUP_ID/d' .env
sed -i.bak '/SUBNET_ID_/d' .env
sed -i.bak '/RDS_INSTANCE_IDENTIFIER/d' .env
sed -i.bak '/RDS_SECRET_NAME/d' .env
rm .env.bak
echo "✅ 清理 .env 文件中的临时配置"

echo -e "${BLUE}📄 设置生产配置...${NC}"
if [ -f "serverless-production.yml" ]; then
    cp serverless-production.yml serverless.yml
    echo "✅ 使用生产版本的 serverless.yml"
fi

echo -e "${BLUE}🔄 重新部署清理后的配置...${NC}"
echo "运行以下命令来部署清理后的版本:"
echo "  serverless deploy --stage dev"
echo ""

echo -e "${GREEN}🎉 清理完成!${NC}"
echo ""
echo -e "${BLUE}📋 保留的文件:${NC}"
echo "✅ backup_file.dump (原始备份文件)"
echo "✅ docs/ (所有文档)"
echo "✅ serverless-production.yml (生产配置)"
echo "✅ package.json.backup (备份)"
echo "✅ .env.backup (备份)"
echo ""
echo -e "${BLUE}🚀 下一步:${NC}"
echo "1. 运行 'serverless deploy --stage dev' 部署清理后的版本"
echo "2. 测试应用功能是否正常"
echo "3. 如果有问题，可以从备份文件恢复"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "- 数据库表结构已经在 AWS RDS 中，不需要重新迁移"
echo "- 如果将来需要迁移，可以从 docs/ 目录查看迁移指南"