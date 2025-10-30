# 🚀 部署地址汇总 - Brand Prod 环境

**部署时间**: 2025-10-28  
**环境**: brand-prod (生产环境)

---

## 📍 部署地址

### 🔧 后端 API (Cloudflare Workers)

**生产环境**：
- **URL**: `https://songbrocade-api-brand-prod.petterbrand03.workers.dev`
- **Version ID**: `a4bc92b4-8e02-4a80-b42a-c04832f9d470`
- **环境**: brand-prod ✓
- **状态**: ✅ 已部署

**配置状态**：
- ✅ Replicate API Key（视频生成）：已配置
- ⚠️ OpenAI API Key（TTS + 文字生成）：需要配置

---

### 🎨 前端 (Cloudflare Pages)

**最新部署**：
- **URL**: `https://2de44c5e.poap-checkin-frontend.pages.dev`
- **别名**: `https://main.poap-checkin-frontend.pages.dev`
- **项目**: poap-checkin-frontend
- **状态**: ✅ 已部署

---

## 🔗 主要页面链接

### 用户端

1. **首页**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/
   ```

2. **商品详情页**（查看文化故事）
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/product.html?id={商品ID}
   ```

3. **商城**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/market/
   ```

4. **签到页面**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/checkin/
   ```

---

### 管理后台

1. **管理员控制台**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/admin/
   ```

2. **文化叙事生成器** 🎬
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/admin/narrative-generator.html
   ```

3. **匠人管理**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/admin/artisans.html
   ```

4. **商品管理**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/admin/products.html
   ```

5. **AI 智能体配置**
   ```
   https://2de44c5e.poap-checkin-frontend.pages.dev/admin/artisan-ai-config.html
   ```

---

## ⚙️ 环境配置

### Brand Prod 环境配置

```bash
# 已配置的密钥
✅ REPLICATE_API_KEY - 视频生成 API
✅ ADMIN_WALLETS - 管理员钱包地址
✅ SHIPPING_KEY - 物流信息加密密钥

# 需要配置的密钥 ⚠️
⏳ OPENAI_API_KEY - 文字生成和 TTS 语音
```

### 配置 OpenAI API Key（必需）

```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api

# 配置到 brand-prod 环境
echo "YOUR_OPENAI_API_KEY" | npx wrangler secret put OPENAI_API_KEY --env brand-prod

# 验证部署
npx wrangler deploy --env brand-prod
```

**获取 OpenAI API Key**：
1. 访问：https://platform.openai.com/api-keys
2. 登录并创建新密钥
3. 复制密钥（格式：`sk-...`）
4. 充值至少 $5

---

## 🧪 测试指南

### 1. 测试后端 API

```bash
# 测试基础连接
curl https://songbrocade-api-brand-prod.petterbrand03.workers.dev/

# 测试商品列表
curl https://songbrocade-api-brand-prod.petterbrand03.workers.dev/products
```

### 2. 测试文化叙事生成（需要配置 OpenAI API Key）

```bash
# 登录管理后台
# 访问：https://2de44c5e.poap-checkin-frontend.pages.dev/admin/

# 进入文化叙事生成器
# 访问：https://2de44c5e.poap-checkin-frontend.pages.dev/admin/narrative-generator.html

# 选择商品并生成：
# 1. 选择叙事类型（故事版/特点版/传承版/使用版）
# 2. 勾选"生成语音版"（可选）
# 3. 勾选"生成视频版"（可选）
# 4. 点击"开始生成"
```

### 3. 测试用户查看文化故事

```bash
# 1. 打开商品详情页
# 访问：https://2de44c5e.poap-checkin-frontend.pages.dev/product.html?id=1

# 2. 点击"了解文化故事"按钮
# 3. 切换叙事类型和媒体格式
# 4. 播放语音或视频
```

---

## 💰 多媒体叙事成本

### 单个商品（4 种叙事类型）

| 配置 | 成本 |
|-----|------|
| 仅文字 | ¥1.72 |
| 文字 + 语音 | ¥1.96 |
| **文字 + 语音 + 视频** | **¥2.84** ⭐ |

### 100 个商品

- 仅文字：**¥172**
- 文字 + 语音：**¥196**
- **全格式**：**¥284** 🎉

---

## 🎯 使用的 AI 模型

### 1. TTS（文字转语音）
- **提供商**: OpenAI
- **模型**: tts-1
- **声音选项**:
  - `nova` - 温柔女声（适合故事）
  - `alloy` - 中性专业声（适合介绍）
  - `onyx` - 沉稳男声（适合传承）
  - `shimmer` - 清晰女声（适合指导）
- **成本**: 约 ¥0.06/个叙事

### 2. 文生视频
- **提供商**: Replicate
- **模型**: Stable Video Diffusion
- **风格选项**:
  - 产品展示风（motion_bucket_id: 80）
  - 叙事电影感（motion_bucket_id: 100）
  - 文化传承风（motion_bucket_id: 60）
  - 实用场景风（motion_bucket_id: 120）
- **成本**: 约 ¥0.22/个叙事
- **时长**: 3-5秒，生成时间 2-5分钟

---

## 📊 部署架构

```
┌─────────────────────────────────────────────────────┐
│               前端 (Cloudflare Pages)                │
│  https://2de44c5e.poap-checkin-frontend.pages.dev  │
└────────────────────┬────────────────────────────────┘
                     │
                     │ API 调用
                     ▼
┌─────────────────────────────────────────────────────┐
│           后端 API (Cloudflare Workers)              │
│  https://songbrocade-api-brand-prod.                │
│         petterbrand03.workers.dev                    │
└────────────────────┬────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
┌─────────┐   ┌──────────┐   ┌──────────┐
│ D1 DB   │   │ R2 Bucket│   │ AI APIs  │
│ poap-db │   │ poap-    │   │ OpenAI   │
│         │   │ images   │   │ Replicate│
└─────────┘   └──────────┘   └──────────┘
```

---

## 🔐 安全配置

### Cloudflare Workers 密钥

```bash
# 查看已配置的密钥
npx wrangler secret list --env brand-prod

# 配置新密钥
npx wrangler secret put SECRET_NAME --env brand-prod

# 删除密钥
npx wrangler secret delete SECRET_NAME --env brand-prod
```

### 管理员权限

- 管理员钱包地址已配置在 `ADMIN_WALLETS` 中
- 只有这些地址可以访问管理后台
- 可以在 Cloudflare Dashboard 中更新

---

## 📚 相关文档

1. **完整实施报告**: `MULTIMEDIA_IMPLEMENTATION_COMPLETE.md`
2. **配置指南**: `MULTIMEDIA_SETUP_GUIDE.md`
3. **API 文档**: 查看 `worker-api/index.js`

---

## 🎉 部署状态总结

✅ **后端 (brand-prod)**: 已部署  
✅ **前端**: 已部署  
✅ **Replicate API**: 已配置  
✅ **数据库**: 已连接  
✅ **R2 存储**: 已连接  
⚠️ **OpenAI API**: 需要配置  

---

## 🚀 下一步

1. **配置 OpenAI API Key** ⚠️
   ```bash
   cd worker-api
   echo "sk-YOUR_KEY" | npx wrangler secret put OPENAI_API_KEY --env brand-prod
   ```

2. **测试功能**
   - 访问管理后台
   - 生成第一个文化故事
   - 测试语音和视频生成

3. **批量生成内容**（可选）
   - 为所有商品生成文化叙事
   - 提升用户体验

---

**部署完成！** 🎊

现在你可以：
- 📱 访问前端：`https://2de44c5e.poap-checkin-frontend.pages.dev`
- 🔧 访问后端：`https://songbrocade-api-brand-prod.petterbrand03.workers.dev`
- 🎬 生成文化故事（配置 OpenAI API Key 后）

