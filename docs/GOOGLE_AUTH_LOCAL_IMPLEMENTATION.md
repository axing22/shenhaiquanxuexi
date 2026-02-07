# Google 登录本地化实现指南

本项目已完成 Google 登录的本地化实现，不再依赖 AI Hub 后端服务。用户数据直接保存到 Supabase 数据库。

## 功能特性

- ✅ 标准 Google OAuth 2.0 登录流程
- ✅ Google One Tap 快捷登录
- ✅ 用户数据保存到 Supabase
- ✅ 新用户自动赠送 10 积分
- ✅ IP 地址追踪
- ✅ 详细的登录日志

## 环境配置

### 1. 配置 Supabase

确保 `.env` 文件中已配置 Supabase 凭证：

```bash
SUPABASE_URL = "your-project-url"
SUPABASE_ANON_KEY = "your-anon-key"
SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
```

### 2. 配置 Google OAuth

#### 步骤 1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目

#### 步骤 2: 启用 Google+ API

1. 在侧边栏选择 "APIs & Services" > "Library"
2. 搜索 "Google+ API"
3. 点击 "Enable"

#### 步骤 3: 创建 OAuth 2.0 凭证

1. 在侧边栏选择 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth client ID"
3. 选择 "Web application"
4. 配置授权重定向 URI：
   ```
   开发环境: http://localhost:3006/api/auth/callback/google
   生产环境: https://yourdomain.com/api/auth/callback/google
   ```
5. 复制 Client ID 和 Client Secret

#### 步骤 4: 配置环境变量

在 `.env` 文件中填写 Google OAuth 凭证：

```bash
# 标准 OAuth 流程（服务端）
AUTH_GOOGLE_ID = "your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET = "your-client-secret"

# One Tap 登录（客户端，可使用相同的 Client ID）
NEXT_PUBLIC_AUTH_GOOGLE_ID = "your-client-id.apps.googleusercontent.com"

# 启用 Google 登录方式
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED = "true"           # 启用标准 OAuth 按钮
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED = "true"  # 启用 One Tap 弹窗登录
```

### 3. 数据库 Schema

确保 Supabase 数据库已执行 `data/install.sql` 中的建表语句：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    nickname VARCHAR(255),
    avatar_url VARCHAR(255),
    locale VARCHAR(50) DEFAULT 'en',
    signin_type VARCHAR(50),
    signin_ip VARCHAR(255),
    signin_provider VARCHAR(50),
    signin_openid VARCHAR(255),
    invite_code VARCHAR(255) NOT NULL DEFAULT '',
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    invited_by VARCHAR(255) NOT NULL DEFAULT '',
    is_affiliate BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (email, signin_provider)
);

-- 积分表
CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_uuid)
);

-- 积分历史表
CREATE TABLE IF NOT EXISTS credit_history (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
```

## 技术实现细节

### 登录流程

```
1. 用户点击 "Sign in with Google" 按钮
   ↓
2. NextAuth 重定向到 Google OAuth 授权页面
   ↓
3. 用户授权后，Google 回调到 /api/auth/callback/google
   ↓
4. NextAuth 触发 jwt callback
   ↓
5. jwt callback 调用 saveUser(dbUser)
   ↓
6. saveUser 检查用户是否存在 (findUserByEmail)
   ↓
7a. 新用户:
    - insertUser() → 写入 Supabase users 表
    - updateUserCredits() → 创建积分记录并赋予 10 积分

7b. 老用户: 返回已有用户信息
   ↓
8. token.user 保存用户信息到 JWT
   ↓
9. session callback 将用户信息添加到 session
   ↓
10. 前端通过 useSession() 获取登录状态
```

### 核心文件

| 文件 | 功能 |
|-----|------|
| `auth/config.ts` | NextAuth 配置，包含 Google OAuth 和 One Tap 提供者 |
| `auth/index.ts` | NextAuth 导出（handlers, signIn, signOut, auth） |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API 路由处理器 |
| `services/user.ts` | 用户保存逻辑，包含新用户积分赠送 |
| `models/user.ts` | 用户数据库操作（Supabase） |
| `models/credit.ts` | 积分数据库操作（Supabase） |
| `hooks/useOneTapLogin.tsx` | Google One Tap Hook |
| `components/auth/signin-form.tsx` | 登录表单组件 |

### 日志系统

所有关键步骤都有详细日志输出，便于调试：

```typescript
[Google One Tap] Verifying token...
[Google One Tap] Token verified for user: user@example.com
[NextAuth JWT] Processing login for: user@example.com
[NextAuth JWT] Client IP: 192.168.1.100
[NextAuth JWT] Saving user to Supabase...
[saveUser] Checking if user exists: user@example.com
[saveUser] New user, inserting to database...
[saveUser] User inserted with UUID: 123e4567-e89b-12d3-a456-426614174000
[saveUser] Granting 10 initial credits to new user
[NextAuth JWT] User saved successfully: 123e4567-e89b-12d3-a456-426614174000
[NextAuth Session] User loaded: user@example.com
```

## 测试步骤

### 1. 本地测试

```bash
# 启动开发服务器
pnpm dev

# 访问登录页面
http://localhost:3006/auth/signin
```

### 2. 验证功能

1. **标准 OAuth 登录**
   - 点击 "Sign in with Google" 按钮
   - 完成 Google 授权流程
   - 验证重定向回应用
   - 检查浏览器控制台日志

2. **One Tap 登录**
   - 刷新页面
   - 观察右上角 Google One Tap 弹窗
   - 点击账号完成登录

3. **数据库验证**
   - 登录 Supabase Dashboard
   - 查看 `users` 表：应有新用户记录
   - 查看 `credits` 表：应有 balance=10 的记录
   - 查看 `credit_history` 表：应有 type="new_user", amount=10 的记录

### 3. Session 验证

在任意页面组件中使用：

```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
console.log("Session:", session);
// 输出: { user: { uuid, email, nickname, avatar_url, ... } }
```

## 故障排查

### 问题 1: "Failed to verify Google token"

**原因**: Google OAuth 凭证配置错误

**解决**:
1. 检查 `AUTH_GOOGLE_ID` 和 `AUTH_GOOGLE_SECRET` 是否正确
2. 确认 Google Cloud Console 中 OAuth 凭证已启用
3. 验证重定向 URI 配置正确

### 问题 2: "Error saving user to Supabase"

**原因**: Supabase 连接或权限问题

**解决**:
1. 检查 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
2. 确认 Supabase 数据库表已创建
3. 检查 Service Role Key 权限（应有完全权限）

### 问题 3: "No user data in session"

**原因**: JWT callback 未正确保存用户信息

**解决**:
1. 检查浏览器控制台和服务器日志
2. 确认 `saveUser` 函数执行成功
3. 验证 `AUTH_SECRET` 已配置

### 问题 4: One Tap 不显示

**原因**: 配置或环境问题

**解决**:
1. 确认 `NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED = "true"`
2. 确认 `NEXT_PUBLIC_AUTH_GOOGLE_ID` 已配置
3. 检查浏览器是否已登录 Google（One Tap 仅在未登录或多账号时显示）
4. 清除浏览器 Cookie 重试

## 安全注意事项

1. **永远不要提交包含真实凭证的 .env 文件到 Git**
2. **生产环境使用 HTTPS**（Google OAuth 要求）
3. **定期轮换 Supabase Service Role Key**
4. **使用环境变量管理敏感信息**
5. **启用 Supabase RLS (Row Level Security)** 保护用户数据

## 后续扩展

可选的功能扩展：

1. **添加更多登录方式**: GitHub, Facebook, Email/Password
2. **用户资料编辑**: 昵称、头像更新
3. **邀请系统**: 邀请码生成和追踪
4. **联盟计划**: 推荐奖励
5. **多语言支持**: 根据用户 locale 自动切换语言

## 参考资源

- [NextAuth.js 文档](https://authjs.dev/)
- [Google OAuth 2.0 指南](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Google One Tap 文档](https://developers.google.com/identity/gsi/web/guides/overview)
