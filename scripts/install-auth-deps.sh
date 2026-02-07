#!/bin/bash

echo "安装 Google 登录所需的依赖..."

pnpm install next-auth@beta

echo "✅ 依赖安装完成！"
echo ""
echo "接下来的步骤:"
echo "1. 配置 Google OAuth 凭据（参考 docs/GOOGLE_AUTH_SETUP.md）"
echo "2. 在 Supabase 中执行 data/install.sql"
echo "3. 更新 .env 文件中的环境变量"
echo "4. 运行 pnpm dev 测试登录功能"
