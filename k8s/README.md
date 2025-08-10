# Backend 服务 K8s 部署指南

## 概述

这个配置用于将 E-Commerce 后端服务部署到 Kubernetes 集群，实现多实例化部署。

## 部署架构

- **多实例部署**: 默认 3 个 Pod 实例，支持自动扩缩容(3-10 个实例)
- **负载均衡**: 通过 Service 实现流量分发
- **健康检查**: 配置了存活性和就绪性探针
- **配置管理**: 使用 ConfigMap 和 Secret 管理配置

## 前置要求

1. Kubernetes 集群已就绪
2. kubectl 已配置并能访问集群
3. 后端服务 Docker 镜像已构建并推送到镜像仓库

## 部署步骤

### 1. 构建并推送 Docker 镜像

```bash
# 在backend目录下构建镜像
cd backend
docker build -t your-registry/ecommerce-backend:latest .
docker push your-registry/ecommerce-backend:latest
```

### 2. 更新配置

编辑以下文件中的配置：

- `deployment.yaml`: 更新镜像地址
- `secret.yaml`: 更新实际的密钥信息(需 base64 编码)
- `ingress.yaml`: 更新域名配置

### 3. 执行部署

```bash
# 方式1: 使用部署脚本
chmod +x deploy.sh
./deploy.sh

# 方式2: 手动部署
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
```

## 验证部署

### 查看 Pod 状态

```bash
kubectl get pods -n ecommerce
```

### 查看服务状态

```bash
kubectl get services -n ecommerce
```

### 查看自动扩缩容状态

```bash
kubectl get hpa -n ecommerce
```

### 查看日志

```bash
kubectl logs -f deployment/backend-deployment -n ecommerce
```

## 访问服务

### 集群内访问

服务地址: `http://backend-service.ecommerce.svc.cluster.local`

### 外部访问

- LoadBalancer: 通过`backend-service-external`服务的外部 IP
- Ingress: 通过配置的域名访问

## 扩缩容管理

### 手动扩缩容

```bash
kubectl scale deployment backend-deployment --replicas=5 -n ecommerce
```

### 自动扩缩容

HPA 会根据 CPU 和内存使用率自动调整实例数量：

- CPU 使用率 > 70% 时扩容
- 内存使用率 > 80% 时扩容
- 最小 3 个实例，最大 10 个实例

## 更新部署

```bash
# 更新镜像
kubectl set image deployment/backend-deployment backend=your-registry/ecommerce-backend:new-tag -n ecommerce

# 查看滚动更新状态
kubectl rollout status deployment/backend-deployment -n ecommerce
```

## 故障排查

### 查看 Pod 详情

```bash
kubectl describe pod <pod-name> -n ecommerce
```

### 查看事件

```bash
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

### 进入 Pod 调试

```bash
kubectl exec -it <pod-name> -n ecommerce -- /bin/sh
```
