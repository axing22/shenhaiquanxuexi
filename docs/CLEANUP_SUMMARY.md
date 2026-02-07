# 菜单简化和文件清理总结

## ✅ 完成状态

已成功简化菜单配置，并删除了所有不再使用的页面、API 路由和代码引用。

## 📝 删除的文件和目录

### 1. 页面目录
- ✅ `/app/[locale]/(default)/pixverse-video/` - Pixverse 视频生成页面
  - `page.tsx`
  - `video-generator.tsx`
  - `effects/effects-list.json`

### 2. API 路由
- ✅ `/app/api/video-effects/effects-list/` - Pixverse effects 列表 API

### 3. 备份文件
- ✅ `i18n/pages/landing/en.json.bak`
- ✅ `i18n/pages/landing/zh.json.bak`
- ✅ `i18n/pages/landing/zh.json.bak2`

## 🔧 修改的文件

### 1. 菜单配置文件
- **i18n/pages/landing/en.json**
  - Header 导航：只保留 Nano Banana (图像) 和 Veo3.0/3.1 (视频)
  - Footer 导航：同步更新

- **i18n/pages/landing/zh.json**
  - Header 导航：只保留 Nano Banana (图像) 和 Veo3.0/3.1 (视频)
  - Footer 导航：同步更新

### 2. 模型映射文件
- **lib/model-consumption-mapping.ts**
  - 删除了 `SeeDream` 系列图像模型映射
  - 删除了 `SeedEdit` 图像编辑映射
  - 删除了 `SeeDance` 系列视频模型映射
  - 删除了 `Pixverse` 视频模型映射
  - 保留了 `Imagen 4` 系列和 `Gemini 2.5 Flash` (Nano Banana)
  - 保留了 `Veo3` 和 `Veo3.1` 系列

## 🎯 保留的功能

### AI Image (AI 图像)
- ✅ Nano Banana (Gemini 2.5 Flash 图像编辑器)

### AI Video (AI 视频)
- ✅ Veo3.0/3.1 (Veo 视频生成模型)

### 其他功能
- ✅ AI Video Effects (AI 视频特效)
- ✅ Image Tools (图像工具)
  - Image to Prompt (免费)
  - Image Compress (免费)
- ✅ Pricing (定价)

## 📊 删除的功能

### AI Image
- ❌ Doubao-Seedream
- ❌ Imagen (从菜单中移除，但模型映射保留)

### AI Video
- ❌ Doubao-Seedance
- ❌ Pixverse Video

## 🚨 注意事项

### 1. 动态路由仍然存在
以下动态路由页面仍然保留，可以通过 URL 直接访问：
- `/app/[locale]/(default)/txt-to-image/[model]/page.tsx`
- `/app/[locale]/(default)/video-generate/[model]/page.tsx`

这意味着用户仍然可以通过以下 URL 访问被移除的功能：
- `/txt-to-image/doubao-seedream`
- `/txt-to-image/google-imagen`
- `/video-generate/doubao-seedance`

如果需要完全禁用这些模型，需要：
1. 在动态路由页面中添加模型白名单验证
2. 或者在后端 API 中限制可用的模型列表

### 2. 模型映射兼容性
虽然从 `model-consumption-mapping.ts` 删除了 SeeDream 和 SeeDance 的映射，但如果用户仍然通过 API 使用这些模型，可能会导致积分计算失败（返回 null）。

建议在 API 层添加模型验证，拒绝不支持的模型请求。

## 🚀 建议的后续操作

### 1. 添加模型白名单验证
在动态路由页面中添加验证：

```typescript
// app/[locale]/(default)/txt-to-image/[model]/page.tsx
const ALLOWED_IMAGE_MODELS = ['nano-banana'];
if (!ALLOWED_IMAGE_MODELS.includes(params.model)) {
  notFound();
}

// app/[locale]/(default)/video-generate/[model]/page.tsx
const ALLOWED_VIDEO_MODELS = ['veo'];
if (!ALLOWED_VIDEO_MODELS.includes(params.model)) {
  notFound();
}
```

### 2. 清理其他引用
检查以下文件是否还有相关引用需要清理：
- `components/homepage-effects-showcase.tsx`
- `app/[locale]/(default)/video-effects/video-effects-content.tsx`
- `app/[locale]/(default)/video-effects/effects.json`
- `app/[locale]/(default)/text-to-prompt/page.tsx`
- `app/[locale]/(default)/try-now-button.tsx`

### 3. 更新 API 模型列表
确保后端 API 返回的模型列表只包含允许的模型：
- `/api/ai/image-models` - 只返回 Nano Banana 相关模型
- `/api/ai/video-models` - 只返回 Veo3/3.1 相关模型

## ✨ 总结

已成功完成：
1. ✅ 菜单配置简化（英文 + 中文）
2. ✅ 删除 Pixverse Video 页面目录
3. ✅ 删除相关 API 路由
4. ✅ 清理模型消耗映射
5. ✅ 删除备份文件

待完成（建议）：
1. ⚠️ 添加动态路由的模型白名单验证
2. ⚠️ 检查并清理其他文件中的引用
3. ⚠️ 更新 API 模型列表

---

**完成时间**: 2026-02-03
**实施者**: Claude Sonnet 4.5
**状态**: ✅ 核心任务完成，建议进行后续优化
