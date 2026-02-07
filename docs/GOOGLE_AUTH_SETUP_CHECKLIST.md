# Google 登录配置清单

使用这个清单快速配置 Google 登录功能。

## ☑️ 配置步骤

### 1. Google Cloud Console 配置

- [ ] 访问 https://console.cloud.google.com/
- [ ] 创建或选择项目
- [ ] 启用 Google+ API
- [ ] 创建 OAuth 2.0 Client ID
- [ ] 添加授权重定向 URI:
  - [ ] 开发环境: `http://localhost:3006/api/auth/callback/google`
  - [ ] 生产环境: `https://yourdomain.com/api/auth/callback/google`
- [ ] 复制 Client ID
- [ ] 复制 Client Secret

### 2. 环境变量配置

编辑 `.env` 文件，填写以下配置：

```bash
# Supabase（应该已配置）
SUPABASE_URL = "your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"

# NextAuth Secret（应该已配置）
AUTH_SECRET = "your-secret-key"

# Google OAuth - 填写从 Google Cloud Console 获取的凭证
AUTH_GOOGLE_ID = "your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET = "your-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID = "your-client-id.apps.googleusercontent.com"

# 启用 Google 登录
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED = "true"
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED = "true"
```

### 3. 数据库配置

- [ ] 登录 Supabase Dashboard
- [ ] 进入 SQL Editor
- [ ] 执行 `data/install.sql` 中的建表语句（如果未执行）
- [ ] 验证以下表已创建:
  - [ ] `users`
  - [ ] `credits`
  - [ ] `credit_history`
  - [ ] `orders`

### 4. 验证配置

运行配置检查脚本：

```bash
./scripts/check-google-auth.sh
```

确保所有检查项都显示 ✅

### 5. 测试登录

```bash
# 启动开发服务器
pnpm dev

# 访问登录页面
# http://localhost:3006/auth/signin
```

- [ ] 点击 "Sign in with Google" 按钮
- [ ] 完成 Google 授权流程
- [ ] 验证重定向回应用
- [ ] 检查用户信息是否正确显示

### 6. 验证数据库

登录 Supabase Dashboard，检查：

- [ ] `users` 表有新记录
- [ ] `credits` 表有对应记录（balance = 10）
- [ ] `credit_history` 表有 "new_user" 类型记录

### 7. 测试 One Tap 登录

- [ ] 退出登录
- [ ] 刷新页面
- [ ] 观察右上角 Google One Tap 弹窗
- [ ] 点击账号完成登录

## 🐛 ��障排查

如果遇到问题，按顺序检查：

1. **查看服务器日志**
   ```bash
   # 日志应包含详细的登录过程
   [NextAuth JWT] Processing login for: user@example.com
   [saveUser] User inserted with UUID: xxx
   ```

2. **查看浏览器控制台**
   - 检查是否有 JavaScript 错误
   - 检查网络请求是否成功

3. **验证环境变量**
   ```bash
   ./scripts/check-google-auth.sh
   ```

4. **检查 Google Cloud Console**
   - OAuth 凭证是否已启用
   - 重定向 URI 是否匹配
   - Google+ API 是否已启用

5. **检查 Supabase**
   - Service Role Key 权限是否正确
   - 数据库表是否已创建
   - RLS 策略是否正确

## ✅ 完成

当所有步骤都完成且测试通过后，你的 Google 登录功能已完全配置完成！

用户数据现在会自动保存到 Supabase，新用户会获得 10 积分奖励。

## 📚 更多信息

详细文档请查看:
- [完整实现指南](./GOOGLE_AUTH_LOCAL_IMPLEMENTATION.md)
- [实现总结](./GOOGLE_AUTH_IMPLEMENTATION_SUMMARY.md)
