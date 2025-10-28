# 🤖 AI API 配置指南

## 📋 概述

本系统支持真实的 AI API 集成，可以实现：
- 🤖 AI 匠人智能体对话
- 📖 文化叙事自动生成
- 🛡️ 内容审核管理

目前支持两种 AI 提供商：
1. **OpenAI GPT-4o / GPT-4o-mini**（推荐）
2. **Claude 3.5 Sonnet**

---

## 🚀 快速开始

### 步骤 1: 获取 API Key

#### 选项 A: OpenAI（推荐）

1. **注册 OpenAI 账号**
   - 访问：https://platform.openai.com/
   - 点击 "Sign Up" 注册账号

2. **创建 API Key**
   - 登录后访问：https://platform.openai.com/api-keys
   - 点击 "Create new secret key"
   - 复制生成的 API Key（格式：`sk-proj-...`）
   - **⚠️ 重要：API Key 只显示一次，请妥善保存**

3. **充值账户**
   - 访问：https://platform.openai.com/account/billing
   - 最低充值：$5 USD
   - 推荐充值：$10-20 USD（可用很长时间）

4. **设置使用限制（可选）**
   - 访问：https://platform.openai.com/account/limits
   - 设置月度预算上限，避免超支

#### 选项 B: Claude（Anthropic）

1. **注册 Anthropic 账号**
   - 访问：https://console.anthropic.com/
   - 点击 "Sign Up" 注册账号

2. **创建 API Key**
   - 登录后访问：https://console.anthropic.com/settings/keys
   - 点击 "Create Key"
   - 复制生成的 API Key（格式：`sk-ant-...`）

3. **充值账户**
   - 访问：https://console.anthropic.com/settings/billing
   - 最低充值：$5 USD

---

### 步骤 2: 配置环境变量

#### 在本地测试环境

```bash
# 进入 worker-api 目录
cd worker-api

# 配置 OpenAI API Key（推荐）
npx wrangler secret put OPENAI_API_KEY
# 粘贴你的 API Key: sk-proj-xxx...

# 或配置 Claude API Key
npx wrangler secret put ANTHROPIC_API_KEY
# 粘贴你的 API Key: sk-ant-xxx...
```

#### 在 Cloudflare Dashboard 配置（推荐）

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages → songbrocade-api
3. 点击 Settings → Variables
4. 添加环境变量：
   - **变量名**: `OPENAI_API_KEY`
   - **类型**: Secret（加密）
   - **值**: 你的 API Key

5. 保存后自动生效

---

### 步骤 3: 验证配置

#### 方法 1: 使用 Demo 页面测试

```bash
# 部署前端
cd ../
npx wrangler pages deploy frontend --project-name=songbrocade-frontend

# 访问测试页面
open https://songbrocade-frontend.pages.dev/demo/artisan-chat-demo.html
```

点击任意"与XX师傅对话"按钮，尝试发送消息。

**成功标志：**
- ✅ AI 回复正常，内容有意义
- ✅ 底部显示模型名称（如 "gpt-4o-mini"）

**失败标志：**
- ❌ 回复内容是 Mock 数据（如 "你好！我是李师傅..."）
- ❌ 底部显示 "mock-ai"

#### 方法 2: 查看后端日志

```bash
cd worker-api
npx wrangler tail
```

发送一条测试消息，查看日志：

**成功示例：**
```
AI reply success: { model: 'gpt-4o-mini', tokensUsed: 120 }
```

**失败示例：**
```
AI 调用失败: Invalid API key
# 或
Using mock AI (no API key configured)
```

#### 方法 3: 直接 API 测试

```bash
# 使用 curl 测试
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/ai/artisan-agent/reply \
  -H "Content-Type: application/json" \
  -d '{
    "artisan_id": "test_artisan",
    "question": "你好，请介绍一下你自己",
    "lang": "zh"
  }'
```

**成功响应：**
```json
{
  "ok": true,
  "answer": "你好！我是XX师傅，专注于传统手工艺...",
  "model": "gpt-4o-mini",
  "log_id": "log_xxx"
}
```

---

## 💰 成本估算

### OpenAI GPT-4o-mini（推荐用于生产）

**定价：**
- 输入：$0.150 / 1M tokens
- 输出：$0.600 / 1M tokens

**对话成本：**
- 平均每条对话：150 tokens（输入）+ 200 tokens（输出）
- 单条成本：$0.000142（约 ¥0.001 人民币）
- 1000 条对话：$0.142（约 ¥1 人民币）

**叙事生成成本：**
- 每个商品生成 4 种叙事：300 tokens（输入）+ 800 tokens（输出）
- 单商品成本：$0.000525（约 ¥0.0038 人民币）
- 100 商品：$0.0525（约 ¥0.38 人民币）

### OpenAI GPT-4o（高质量）

**定价：**
- 输入：$2.50 / 1M tokens
- 输出：$10.00 / 1M tokens

**对话成本：**
- 单条成本：$0.00238（约 ¥0.017 人民币）
- 1000 条对话：$2.38（约 ¥17 人民币）

**叙事生成成本：**
- 单商品成本：$0.00875（约 ¥0.063 人民币）
- 100 商品：$0.875（约 ¥6.3 人民币）

### Claude 3.5 Sonnet

**定价：**
- 输入：$3.00 / 1M tokens
- 输出：$15.00 / 1M tokens

**对话成本：**
- 单条成本：$0.00345（约 ¥0.025 人民币）
- 1000 条对话：$3.45（约 ¥25 人民币）

---

## 📊 使用建议

### 开发测试阶段

**选择：GPT-4o-mini**
- ✅ 成本低（95% 更便宜）
- ✅ 响应快（平均 1-2 秒）
- ✅ 质量足够好
- 💡 预算：$10 可用几个月

### 生产环境

#### 对话功能（高频）
**推荐：GPT-4o-mini**
- 适合大量用户交互
- 每天 1000 条对话成本 < $0.15

#### 叙事生成（低频）
**推荐：GPT-4o 或 Claude 3.5**
- 质量更高，更有文化深度
- 生成频率低，成本可控
- 100 商品仅需 $0.88 或 $1.05

### 混合方案（最优）

```javascript
// 在 worker-api/index.js 中配置
const AI_CONFIG = {
  // 对话：使用便宜的模型
  chat: {
    provider: 'openai',
    model: 'gpt-4o-mini'
  },
  // 叙事生成：使用高质量模型
  narrative: {
    provider: 'openai',
    model: 'gpt-4o'  // 或 'claude'
  }
};
```

---

## 🔒 安全最佳实践

### 1. API Key 保护

❌ **错误做法：**
```javascript
// 不要在前端代码中暴露 API Key
const OPENAI_API_KEY = 'sk-proj-xxx...';
```

✅ **正确做法：**
```bash
# 使用 Cloudflare Workers 环境变量
npx wrangler secret put OPENAI_API_KEY
```

### 2. 速率限制

在 `worker-api/index.js` 中添加：

```javascript
// 简单的速率限制（每个 IP 每分钟最多 10 次请求）
const RATE_LIMIT = 10; // 请求数/分钟
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // 清除 1 分钟前的请求记录
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false; // 超过限制
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// 在 AI API 路由中使用
if (pathname === "/ai/artisan-agent/reply" && req.method === "POST") {
  const clientIP = req.headers.get('CF-Connecting-IP');
  
  if (!checkRateLimit(clientIP)) {
    return withCors(errorResponse("Rate limit exceeded", 429), pickAllowedOrigin(req));
  }
  
  // ... 继续处理请求
}
```

### 3. 内容过滤

已实现的 `moderateContent()` 函数会自动过滤：
- 敏感词（政治、暴力、色情等）
- 超长文本（> 2000 字符）
- 垃圾信息

### 4. 用户身份验证（可选）

如果需要限制只有登录用户才能使用 AI 对话：

```javascript
// 在 worker-api/index.js 中
if (pathname === "/ai/artisan-agent/reply" && req.method === "POST") {
  // 要求用户登录
  const userCheck = await requireUser(req, env);
  if (!userCheck.ok) {
    return withCors(errorResponse("请先登录", 401), pickAllowedOrigin(req));
  }
  
  // ... 继续处理
}
```

---

## 🐛 常见问题

### Q1: 提示 "AI 助手暂时无法回答"

**可能原因：**
1. API Key 未配置或配置错误
2. API Key 余额不足
3. 网络连接问题

**解决方法：**
```bash
# 检查环境变量
cd worker-api
npx wrangler secret list

# 重新配置
npx wrangler secret put OPENAI_API_KEY

# 检查余额
# OpenAI: https://platform.openai.com/account/usage
# Claude: https://console.anthropic.com/settings/billing
```

### Q2: 回复速度很慢（> 10 秒）

**可能原因：**
1. 使用了 GPT-4o（响应较慢）
2. Prompt 太长

**解决方法：**
```javascript
// 切换到 GPT-4o-mini（响应快 3-5 倍）
const config = {
  model: 'gpt-4o-mini',  // 改用 mini 版本
  temperature: 0.7,
  max_tokens: 500  // 限制输出长度
};
```

### Q3: 对话内容不相关或质量差

**可能原因：**
1. 匠人 AI 配置（artisan_voice）未设置
2. Prompt 设计不合理

**解决方法：**
1. 访问管理后台配置匠人 AI 人格
2. 在 `worker-api/utils/ai-helpers.js` 中优化 Prompt

### Q4: 成本超出预期

**解决方法：**
1. 切换到 GPT-4o-mini
2. 减少 max_tokens 限制
3. 实施速率限制
4. 添加缓存机制（相同问题返回缓存答案）

---

## 📈 监控与优化

### 1. 查看实时日志

```bash
cd worker-api
npx wrangler tail --format pretty
```

### 2. 成本监控

**OpenAI：**
- 访问：https://platform.openai.com/account/usage
- 查看每日/每月 Token 消耗和费用

**Claude：**
- 访问：https://console.anthropic.com/settings/billing
- 查看使用统计

### 3. 数据库统计

```sql
-- 查看 AI 对话统计
SELECT 
  DATE(created_at, 'unixepoch') as date,
  COUNT(*) as chat_count,
  SUM(tokens_used) as total_tokens,
  AVG(response_time_ms) as avg_response_time
FROM artisan_agent_logs
WHERE created_at > strftime('%s', 'now', '-7 days')
GROUP BY date
ORDER BY date DESC;

-- 查看热门匠人
SELECT 
  artisan_id,
  COUNT(*) as chat_count,
  SUM(tokens_used) as total_tokens
FROM artisan_agent_logs
GROUP BY artisan_id
ORDER BY chat_count DESC
LIMIT 10;
```

---

## ✅ 配置完成检查清单

- [ ] 获取了 API Key（OpenAI 或 Claude）
- [ ] 充值了账户（至少 $5）
- [ ] 配置了环境变量（`OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`）
- [ ] 部署了后端 API（`npx wrangler deploy`）
- [ ] 测试了 AI 对话功能（非 Mock 回复）
- [ ] 配置了至少一个匠人的 AI 人格（`/admin/artisan-ai-config.html`）
- [ ] 测试了商品详情页的"与匠人对话"按钮
- [ ] 设置了速率限制（可选）
- [ ] 配置了成本监控告警（可选）

---

## 🎉 下一步

配置完成后，你可以：

1. **测试用户对话**
   - 访问：`https://songbrocade-frontend.pages.dev/product.html?id=xxx`
   - 点击"与匠人对话"按钮
   - 体验真实的 AI 对话

2. **生成文化叙事**
   - 访问：`https://songbrocade-frontend.pages.dev/admin/narrative-generator.html`
   - 选择商品，生成多种叙事版本

3. **审核内容**
   - 访问：`https://songbrocade-frontend.pages.dev/admin/ai-moderation.html`
   - 查看被标记的对话，进行审核

4. **配置 AI 人格**
   - 访问：`https://songbrocade-frontend.pages.dev/admin/artisan-ai-config.html`
   - 为每个匠人配置专属的 AI 人格

---

**需要帮助？**
- 查看后端日志：`cd worker-api && npx wrangler tail`
- 查看浏览器控制台：F12 → Console
- 检查 API 响应：Network → 查找 `/ai/` 开头的请求

**祝配置顺利！** 🎊

