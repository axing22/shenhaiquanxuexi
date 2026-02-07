#!/bin/bash

echo "🚀 启动开发服务器并检查日志..."

# 启动服务
pnpm dev > /tmp/next-dev-debug.log 2>&1 &
DEV_PID=$!
echo "PID: $DEV_PID"

# 等待启动
sleep 10

echo ""
echo "=== Supabase 环境变量日志 ==="
grep -i "supabase\|环境变量" /tmp/next-dev-debug.log | tail -30

echo ""
echo "=== 完整错误日志 ==="
tail -50 /tmp/next-dev-debug.log

# 停止服务
kill $DEV_PID 2>/dev/null
echo ""
echo "✅ 测试完成"
