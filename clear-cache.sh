#!/bin/bash

# 清理 Next.js 缓存
echo "清理 Next.js 缓存..."
rm -rf .next
rm -rf node_modules/.cache

# 清理 TypeScript 缓存
echo "清理 TypeScript 缓存..."
rm -rf tsconfig.tsbuildinfo

echo "缓存清理完成！"
echo "请运行 'npm run dev' 重新启动开发服务器"