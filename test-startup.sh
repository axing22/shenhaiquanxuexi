#!/bin/bash

echo "🚀 开始测试服务启动..."
echo ""

# 停止现有服务
pkill -f "next dev" 2>/dev/null
sleep 1

# 启动服务
echo "1️⃣ 启动开发服务器..."
pnpm dev > /tmp/next-dev.log 2>&1 &
DEV_PID=$!

# 等待服务启动
echo "2️⃣ 等待服务就绪..."
for i in {1..20}; do
  sleep 1
  if curl -s http://localhost:3006/api/health > /dev/null 2>&1; then
    echo "✅ 服务已启动！"
    echo ""
    echo "📋 测试结果:"
    curl -s http://localhost:3006/api/health | grep -o '"status":"[^"]*"' || echo "  API 响应正常"
    echo ""
    echo "🌐 访问地址:"
    echo "  http://localhost:3006"
    echo ""
    echo "📝 日志文件: /tmp/next-dev.log"
    echo ""
    echo "⚠️  测试完成，服务保持运行中 (PID: $DEV_PID)"
    echo "   停止服务: pkill -f 'next dev'"
    exit 0
  fi
  echo "   等待中... ($i/20)"
done

echo "❌ 服务启动失败"
echo ""
echo "📋 错误日志:"
tail -20 /tmp/next-dev.log
echo ""

# 清理
kill $DEV_PID 2>/dev/null
exit 1
