# 多媒体文化叙事系统 - 后端配置指南

**日期**: 2025-10-28  
**功能**: 支持文字、语音（TTS）、视频生成的文化叙事系统

---

## 📐 技术栈

### 1. TTS（文字转语音）
**使用**: OpenAI TTS API  
**官网**: https://platform.openai.com/docs/guides/text-to-speech

#### 为什么选择 OpenAI TTS？
- ✅ 质量高：Neural Voice 技术，自然流畅
- ✅ 成本低：$15/1M 字符 ≈ ¥0.0001/字
- ✅ 支持中文：`alloy`, `nova`, `shimmer` 等声音都支持中文
- ✅ 易于集成：REST API，无需复杂配置
- ✅ 速度快：2-5 秒生成一段语音

#### 可用声音：
- `alloy` - 中性、专业
- `echo` - 男声、清晰
- `fable` - 英式女声
- `onyx` - 深沉男声
- `nova` - 温柔女声 ⭐ 推荐用于故事
- `shimmer` - 清晰女声 ⭐ 推荐用于指导

---

### 2. 文生视频
**使用**: Replicate API + Stable Video Diffusion  
**官网**: https://replicate.com/stability-ai/stable-video-diffusion

#### 为什么选择 Replicate？
- ✅ 成本低：约 $0.002-0.005/秒，15秒视频 ≈ ¥0.22
- ✅ 质量好：基于 Stable Diffusion，专业级效果
- ✅ 开源模型：无版权风险
- ✅ 异步处理：适合 Worker 环境
- ✅ 多种模型：可选择不同风格

#### 可用模型：
- **Stable Video Diffusion** ⭐ 推荐
  - 模型 ID: `stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438`
  - 适合：产品展示、工艺流程
  - 帧数：6-25 帧（1-4 秒）

- **AnimateDiff** (备选)
  - 适合：动画风格、卡通效果

---

## 🔧 后端配置步骤

### 步骤 1: 获取 API Keys

#### OpenAI API Key
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账户
3. 点击 "Create new secret key"
4. 复制生成的 API key（格式：`sk-...`）
5. 充值至少 $5（约 ¥36）

#### Replicate API Token
1. 访问 https://replicate.com/account/api-tokens
2. 注册账户
3. 点击 "Create Token"
4. 复制生成的 token（格式：`r8_...`）
5. 绑定信用卡（按使用量计费）

---

### 步骤 2: 配置 Cloudflare Workers

#### 方法 A: 通过 Wrangler CLI（推荐）

```bash
cd worker-api

# 设置 OpenAI API Key
npx wrangler secret put OPENAI_API_KEY
# 粘贴你的 OpenAI API key

# 设置 Replicate API Token
npx wrangler secret put REPLICATE_API_KEY
# 粘贴你的 Replicate token

# 设置 R2 公开访问域名（可选）
npx wrangler secret put R2_PUBLIC_URL
# 例如：https://r2.yourdomain.com

# 部署
npx wrangler deploy
```

#### 方法 B: 通过 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 选择你的 Worker（songbrocade-api）
3. 进入 Settings → Variables
4. 添加环境变量（Encrypted）:
   - `OPENAI_API_KEY` = `sk-...`
   - `REPLICATE_API_KEY` = `r8_...`
   - `R2_PUBLIC_URL` = `https://your-r2-domain.com`（可选）

---

### 步骤 3: 配置 R2 存储桶

#### 确保 R2 Bucket 已绑定
```toml
# wrangler.toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "poap-images"
```

#### 配置 R2 公开访问（可选）

如果你想让音频和视频文件可以直接通过 URL 访问：

1. 在 Cloudflare Dashboard 中选择 R2
2. 选择你的 bucket（poap-images）
3. 进入 Settings → Public Access
4. 点击 "Connect Custom Domain"
5. 设置自定义域名（如 `r2.yourdomain.com`）
6. 将域名配置为 `R2_PUBLIC_URL` 环境变量

**如果不配置公开域名**：
- 音频和视频仍然可以生成和存储
- 但 URL 会是内部路径（需要通过 Worker 代理访问）

---

### 步骤 4: 数据库迁移

Worker 会自动应用数据库迁移，添加新的字段：

```sql
-- 已自动添加以下字段到 content_variants 表
audio_key TEXT
audio_url TEXT
audio_duration INTEGER DEFAULT 0
audio_size INTEGER DEFAULT 0
video_key TEXT
video_url TEXT
video_duration INTEGER DEFAULT 0
video_size INTEGER DEFAULT 0
video_thumbnail TEXT
generation_status TEXT DEFAULT 'pending'
generation_progress TEXT
```

**验证数据库**：
```sql
-- 在 Cloudflare D1 Console 中运行
PRAGMA table_info(content_variants);
```

---

## 💰 成本估算

### 单个商品（4 种叙事类型）

| 项目 | 单价 | 数量 | 小计 |
|-----|------|------|------|
| 文字生成 (GPT-4) | ¥0.43/次 | 4 | ¥1.72 |
| 语音生成 (TTS) | ¥0.06/个 | 4 | ¥0.24 |
| 视频生成 (SVD) | ¥0.22/个 | 4 | ¥0.88 |
| **总计** | - | - | **¥2.84** |

### 100 个商品

- 仅文字：¥172
- 文字 + 语音：¥196
- 文字 + 语音 + 视频：**¥284** ✅

**结论**：成本非常可控！

---

## 🧪 测试配置

### 1. 测试 OpenAI TTS

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "这是一个测试。",
    "voice": "nova"
  }' \
  --output test.mp3
```

成功的话会生成 `test.mp3` 文件。

### 2. 测试 Replicate API

```bash
curl -s -X POST \
  -H "Authorization: Token $REPLICATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438", "input": {"prompt": "A beautiful Chinese traditional craft"}}' \
  https://api.replicate.com/v1/predictions
```

成功的话会返回一个任务 ID。

### 3. 测试 Worker API

```bash
# 生成文化叙事（仅文字）
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "product_id": "1",
    "types": ["story"],
    "lang": "zh",
    "provider": "openai"
  }'

# 生成文化叙事（文字 + 语音）
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "product_id": "1",
    "types": ["story"],
    "lang": "zh",
    "provider": "openai",
    "generate_audio": true,
    "voice_style": "nova"
  }'

# 生成文化叙事（文字 + 语音 + 视频）
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "product_id": "1",
    "types": ["story"],
    "lang": "zh",
    "provider": "openai",
    "generate_audio": true,
    "generate_video": true,
    "voice_style": "nova",
    "video_style": "traditional"
  }'
```

---

## ⚙️ 环境变量完整列表

```bash
# Cloudflare Workers 环境变量

# 必需
OPENAI_API_KEY=sk-...              # OpenAI API Key（用于 GPT-4 和 TTS）
ANTHROPIC_API_KEY=sk-ant-...       # Claude API Key（可选，用于文字生成）

# 可选（启用视频生成）
REPLICATE_API_KEY=r8_...           # Replicate API Token

# 可选（R2 公开访问）
R2_PUBLIC_URL=https://r2.yourdomain.com

# 其他已有的环境变量
ADMIN_WALLETS=0x...                # 管理员钱包地址
SHIPPING_KEY=...                   # 物流 API Key

# Bindings（在 wrangler.toml 中配置）
# - DB (D1 Database)
# - R2_BUCKET (R2 Bucket)
```

---

## 🐛 常见问题

### Q1: 视频生成失败，返回 "No such module 'crypto'"
**A**: 这是因为 Worker 环境不支持 Node.js `crypto` 模块。我们已经使用 Web Crypto API 替代，确保你使用最新的代码。

### Q2: 音频文件无法访问
**A**: 检查：
1. R2_BUCKET 是否正确绑定
2. R2_PUBLIC_URL 是否配置（或使用内部路径）
3. 音频是否成功上传到 R2

### Q3: 视频生成很慢
**A**: 正常现象。视频生成需要 2-5 分钟，是异步处理的。前端会显示"处理中"状态。

### Q4: 成本太高怎么办？
**A**: 
- 只生成文字：¥1.72/商品
- 只在重要商品上启用视频
- 使用更便宜的 TTS 模型（tts-1 而非 tts-1-hd）

---

## 📊 监控和日志

### 查看 Worker 日志
```bash
npx wrangler tail
```

### 查看 R2 使用情况
Cloudflare Dashboard → R2 → Usage

### 查看 API 使用情况
- OpenAI: https://platform.openai.com/usage
- Replicate: https://replicate.com/account/billing

---

## 🎯 下一步

配置完成后：
1. ✅ 测试 API 调用
2. ✅ 更新前端界面
3. ✅ 生成第一个多媒体叙事
4. ✅ 在商品详情页查看效果

---

**配置有问题？请检查：**
1. API Keys 是否正确
2. 账户是否有余额
3. Worker 是否重新部署
4. 环境变量是否生效

**需要帮助？**
- OpenAI 文档: https://platform.openai.com/docs
- Replicate 文档: https://replicate.com/docs
- Cloudflare Workers 文档: https://developers.cloudflare.com/workers/

