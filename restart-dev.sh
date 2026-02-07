#!/bin/bash

echo "🔄 正在清理缓存并重启开发服务器..."
echo ""

# 1. 停止现有的开发服务器
echo "1️⃣ 停止现有的开发服务器..."
pkill -f "next dev" 2>/dev/null
sleep 1

# 2. 清理 Next.js 缓存
echo "2️⃣ 清理 .next 缓存..."
rm -rf .next

# 3. 验证 next-auth 安装
echo "3️⃣ 验证 next-auth 安装..."
if grep -q "next-auth" package.json; then
    echo "   ✓ next-auth 已在 package.json 中"
else
    echo "   ✗ next-auth 未找到，正在安装..."
    pnpm install next-auth@beta
fi

echo ""
echo "✅ 准备完成！现在请运行："
echo ""
echo "   pnpm dev"
echo ""
