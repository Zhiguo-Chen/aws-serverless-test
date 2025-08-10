#!/bin/bash

# 设置AKS集群自动关机/开机
set -e

RESOURCE_GROUP="ecommerce-test-rg"
AKS_CLUSTER_NAME="ecommerce-test-aks"

echo "⏰ 设置AKS集群自动关机/开机..."

# 创建关机脚本
cat > shutdown-aks.sh << 'EOF'
#!/bin/bash
echo "🌙 $(date): 关闭AKS集群以节省成本..."
az aks stop --name ecommerce-test-aks --resource-group ecommerce-test-rg
echo "✅ AKS集群已关闭"
EOF

# 创建开机脚本
cat > startup-aks.sh << 'EOF'
#!/bin/bash
echo "🌅 $(date): 启动AKS集群..."
az aks start --name ecommerce-test-aks --resource-group ecommerce-test-rg
echo "✅ AKS集群已启动"
EOF

chmod +x shutdown-aks.sh startup-aks.sh

echo "📋 自动化选项："
echo ""
echo "选项1: 使用crontab（本地机器）"
echo "----------------------------------------"
echo "# 每天晚上10点关机"
echo "0 22 * * * /path/to/shutdown-aks.sh >> /var/log/aks-schedule.log 2>&1"
echo ""
echo "# 工作日早上8点开机"
echo "0 8 * * 1-5 /path/to/startup-aks.sh >> /var/log/aks-schedule.log 2>&1"
echo ""
echo "设置命令："
echo "crontab -e"
echo ""

echo "选项2: 使用Azure自动化账户"
echo "----------------------------------------"
echo "1. 在Azure门户创建自动化账户"
echo "2. 创建PowerShell Runbook"
echo "3. 设置定时触发器"
echo ""

echo "选项3: 使用Azure Logic Apps"
echo "----------------------------------------"
echo "1. 创建Logic App"
echo "2. 添加定时触发器"
echo "3. 添加AKS启动/停止操作"
echo ""

echo "选项4: 手动控制"
echo "----------------------------------------"
echo "关闭集群: ./shutdown-aks.sh"
echo "启动集群: ./startup-aks.sh"
echo ""

echo "💰 成本节省估算："
echo "   24小时运行: $8/月"
echo "   12小时运行: $4/月"
echo "   8小时运行: $2.7/月"
echo ""

echo "⚠️  注意事项："
echo "   - 关机时无法访问应用"
echo "   - 重启需要2-3分钟"
echo "   - 数据库数据会保留（如果使用持久卷）"
echo "   - 公网IP可能会变化"

# 创建Azure自动化脚本模板
cat > azure-automation-runbook.ps1 << 'EOF'
# Azure自动化Runbook - AKS关机
param(
    [Parameter(Mandatory=$true)]
    [string]$Action  # "start" 或 "stop"
)

$resourceGroupName = "ecommerce-test-rg"
$aksClusterName = "ecommerce-test-aks"

# 连接到Azure
$connectionName = "AzureRunAsConnection"
$servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
Connect-AzAccount -ServicePrincipal -TenantId $servicePrincipalConnection.TenantId -ApplicationId $servicePrincipalConnection.ApplicationId -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint

if ($Action -eq "stop") {
    Write-Output "停止AKS集群: $aksClusterName"
    Stop-AzAksCluster -ResourceGroupName $resourceGroupName -Name $aksClusterName
    Write-Output "AKS集群已停止"
} elseif ($Action -eq "start") {
    Write-Output "启动AKS集群: $aksClusterName"
    Start-AzAksCluster -ResourceGroupName $resourceGroupName -Name $aksClusterName
    Write-Output "AKS集群已启动"
} else {
    Write-Error "无效的操作: $Action. 请使用 'start' 或 'stop'"
}
EOF

echo ""
echo "✅ 自动关机脚本已创建！"
echo ""
echo "📁 创建的文件："
echo "   - shutdown-aks.sh (关机脚本)"
echo "   - startup-aks.sh (开机脚本)"
echo "   - azure-automation-runbook.ps1 (Azure自动化模板)"
echo ""
echo "🎯 推荐设置："
echo "   工作日 8:00-18:00 运行 (10小时)"
echo "   周末完全关闭"
echo "   预计月费用: $3-4"