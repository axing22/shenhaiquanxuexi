# Google 登录功能配置清单

## ✅ 已完成

- [x] 安装 next-auth@beta 依赖
- [x] 创建认证配置文件
- [x] 创建数据库模型
- [x] 创建登录组件
- [x] 更新布局文件
- [x] 创建数据库表结构文件

## 📋 待完成（按顺序）

### 1. 配置 Google OAuth（5分钟）

- [ ] 访问 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 创建/选择项目
- [ ] 创建 OAuth 2.0 凭据
- [ ] 添加重定向 URI：`http://localhost:3006/api/auth/callback/google`
- [ ] 复制 Client ID 和 Client Secret

### 2. 更新环境变量（2分钟）

编辑 `.env` 文件，填入以下信息：

```bash
# Google OAuth 凭据（从 Google Cloud Console 获取）
AUTH_GOOGLE_ID="你的-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="你的-client-secret"
NEXT_PUBLIC_AUTH_GOOGLE_ID="你的-client-id.apps.googleusercontent.com"

# 启用 Google 登录
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# Supabase 数据库（确保已填写）
SUPABASE_URL="https://你的项目.supabase.co"
SUPABASE_ANON_KEY="你的-anon-key"
SUPABASE_SERVICE_ROLE_KEY="你的-service-role-key"
```

### 3. 配置 Supabase 数据库（3分钟）

- [ ] 登录 [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] 进入你的项目
- [ ] 打开 SQL Editor
- [ ] 复制并执行 `data/install.sql` 的内容
- [ ] 验证表是否创建成功（users, credits, credit_history）

### 4. 重启开发服务器（1分钟）

```bash
# 如果服务器正在运行，先停止（Ctrl+C）
pnpm dev
```

### 5. 测试登录功能（2分钟）

- [ ] 访问 `http://localhost:3006/auth/signin`
- [ ] 点击 "Continue with Google"
- [ ] 完成 Google 授权
- [ ] 验证登录成功
- [ ] 检查 Supabase 中是否创建了用户记录

## 🔍 验证步骤

### 检查数据库

在 Supabase Dashboard 中：

1. 打开 Table Editor
2. 查看 `users` 表 - 应该有你的用户记录
3. 查看 `credits` 表 - 应该有对应的积分记录
4. 查看 `credit_history` 表 - 应该有初始积分记录

### 检查 Session

在浏览器控制台中：

```javascript
// 应该返回你的用户信息
console.log(window.localStorage)
```

## ⚠️ 常见问题

### 1. 重定向 URI 不匹配

**错误**: `redirect_uri_mismatch`

**解决**: 
- 确保 Google Cloud Console 中的重定向 URI 与实际 URL 完全一致
- 开发环境：`http://localhost:3006/api/auth/callback/google`
- 不要添加尾部斜杠

### 2. 数据库连接失败

**错误**: 用户创建失败

**解决**:
- 检查 `.env` 中的 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
- 确保使用的是 Service Role Key，不是 Anon Key
- 验证数据库表是否已创建

### 3. Session 未保存

**错误**: 刷新页面后登录状态丢失

**解决**:
- 检查 `AUTH_SECRET` 是否已设置
- 清除浏览器缓存和 cookies
- 重启开发服务器

### 4. Google One Tap 不显示

**原因**: 默认未启用

**启用方法**:
```bash
# 在 .env 中添加
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED="true"
```

## 📚 相关文档

- `GOOGLE_AUTH_IMPLEMENTATION.md` - 完整实现说明
- `docs/GOOGLE_AUTH_SETUP.md` - 详细配置指南
- `data/install.sql` - 数据库表结构

## 🎯 下一步（可选）

完成基本配置后，你可以：

- [ ] 添加 GitHub 登录（参考 `auth/config.ts` 注释）
- [ ] 自定义登录页面样式
- [ ] 配置 Google One Tap 自动登录
- [ ] 添加用户个人资料页面
- [ ] 实现退出登录功能
- [ ] 设置 Session 过期时间

---

**预计总耗时**: 约 15 分钟

一旦完成以上步骤，你的项目就拥有了完整的 Google 登录功能！🎉
