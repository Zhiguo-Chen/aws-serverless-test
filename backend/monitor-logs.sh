#!/bin/bash

echo "📊 实时监控服务日志..."
echo "====================="
echo "按 Ctrl+C 停止监控"
echo ""

# 创建一个函数来显示彩色日志
show_logs() {
    local service=$1
    local color=$2
    
    docker-compose logs -f --tail=10 $service 2>/dev/null | while read line; do
        echo -e "\033[${color}m[$service]\033[0m $line"
    done &
}

# 启动各服务的日志监控
show_logs "backend" "32"    # 绿色
show_logs "postgres" "34"   # 蓝色  
show_logs "mongo" "33"      # 黄色

# 等待用户中断
wait