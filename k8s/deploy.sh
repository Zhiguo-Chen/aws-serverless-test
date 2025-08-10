#!/bin/bash

# K8s部署脚本
set -e

echo "开始部署E-Commerce后端服务到Kubernetes..."

# 检查kubectl是否可用
if ! command -v kubectl &> /dev/null; then
    echo "错误: kubectl未安装或不在PATH中"
    exit 1
fi

# 检查集群连接
if ! kubectl cluster-info &> /dev/null; then
    echo "错误: 无法连接到Kubernetes集群"
    exit 1
fi

# 创建命名空间
echo "创建命名空间..."
kubectl apply -f namespace.yaml

# 应用ConfigMap和Secret
echo "应用配置..."
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# 部署应用
echo "部署后端服务..."
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 等待部署完成
echo "等待部署完成..."
kubectl rollout status deployment/backend-deployment -n ecommerce --timeout=300s

# 应用HPA
echo "配置自动扩缩容..."
kubectl apply -f hpa.yaml

# 可选：应用Ingress（如果有Ingress Controller）
if kubectl get ingressclass &> /dev/null; then
    echo "配置Ingress..."
    kubectl apply -f ingress.yaml
fi

echo "部署完成！"
echo ""
echo "查看部署状态:"
echo "kubectl get pods -n ecommerce"
echo "kubectl get services -n ecommerce"
echo "kubectl get hpa -n ecommerce"
echo ""
echo "查看日志:"
echo "kubectl logs -f deployment/backend-deployment -n ecommerce"