# 本地 Docker 开发指南

## 🐳 什么是 Docker？

Docker 就像一个"虚拟盒子"，把你的应用和所有依赖打包在一起：

- **镜像(Image)**: 应用的"模板"
- **容器(Container)**: 运行中的"实例"
- **Dockerfile**: 构建镜像的"说明书"

## 🚀 快速启动

### 方式 1：使用 Docker Compose（推荐）

```bash
# 在backend目录下
cd backend

# 启动所有服务（后端+数据库）
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 方式 2：单独构建和运行

```bash
# 构建镜像
docker build -t ecommerce-backend .

# 运行容器
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=your-password \
  ecommerce-backend
```

## 📋 服务访问地址

启动成功后，你可以访问：

- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017
- **PgAdmin**: http://localhost:8080 (admin@example.com / admin123)

## 🛠️ 常用命令

### 启动和停止

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启后端服务
docker-compose restart backend

# 强制重新构建
docker-compose up --build
```

### 查看状态

```bash
# 查看运行的容器
docker-compose ps

# 查看日志
docker-compose logs backend
docker-compose logs postgres

# 实时查看日志
docker-compose logs -f backend
```

### 进入容器调试

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec postgres psql -U postgres -d E-Commerce
```

### 数据库操作

```bash
# 查看数据库
docker-compose exec postgres psql -U postgres -l

# 连接到应用数据库
docker-compose exec postgres psql -U postgres -d E-Commerce

# 备份数据库
docker-compose exec postgres pg_dump -U postgres E-Commerce > backup.sql
```

## 🔧 开发模式

### 启用代码热重载

```bash
# 使用开发版Dockerfile
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 挂载本地代码

docker-compose.yml 已配置代码挂载，修改代码会自动重启服务。

## 🐛 故障排查

### 常见问题

**1. 端口被占用**

```bash
# 查看端口占用
lsof -i :3000

# 停止占用端口的进程
kill -9 <PID>
```

**2. 数据库连接失败**

```bash
# 检查数据库是否启动
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres
```

**3. 镜像构建失败**

```bash
# 清理Docker缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

**4. 容器无法启动**

```bash
# 查看详细错误
docker-compose logs backend

# 检查容器状态
docker-compose ps
```

### 调试技巧

**查看容器内部**

```bash
# 进入容器
docker-compose exec backend sh

# 查看文件
ls -la /app

# 查看环境变量
env | grep DB
```

**测试数据库连接**

```bash
# 从容器内测试
docker-compose exec backend node -e "
const { testConnection } = require('./dist/models');
testConnection().then(console.log);
"
```

## 📊 性能监控

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats backend_backend_1
```

### 日志管理

```bash
# 限制日志大小
docker-compose logs --tail=100 backend

# 清理日志
docker-compose down
docker system prune -f
```

## 🔄 数据持久化

Docker Compose 已配置数据卷：

- `postgres_data`: PostgreSQL 数据
- `mongo_data`: MongoDB 数据
- `./uploads`: 文件上传目录

即使删除容器，数据也会保留。

## 🚀 生产环境准备

### 构建生产镜像

```bash
# 使用生产Dockerfile
docker build -f Dockerfile -t ecommerce-backend:prod .

# 推送到注册表
docker tag ecommerce-backend:prod your-registry/ecommerce-backend:latest
docker push your-registry/ecommerce-backend:latest
```

### 环境变量管理

生产环境使用 `.env` 文件：

```bash
# 创建生产环境配置
cp .env.example .env.prod
# 编辑实际的生产配置
```

这样你就可以在本地完全模拟生产环境，确保代码在任何地方都能正常运行！
