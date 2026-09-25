#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "🚀 正在启动「非典型思考者 · 工作状态切片」..."
echo "📱 浏览器将自动打开：http://localhost:5173"
echo "💡 关闭此窗口即可停止程序"
echo "=================================================="

# 延迟1秒自动打开浏览器
(sleep 1 && open "http://localhost:5173") &

# 启动本地服务
npm run dev
