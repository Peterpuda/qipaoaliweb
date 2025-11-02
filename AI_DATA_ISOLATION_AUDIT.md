# AI 数据隔离审计报告

## 🔍 问题描述

**用户报告**：不同的商品都在使用同一个文化故事，怀疑路由逻辑和 AI 配置没有起作用。

**预期行为**：
- 每个商品应该有独立的文化故事（通过 `product_id` 绑定）
- 每位匠人应该有独立的对话内容（通过 `artisan_id` 绑定）
- 后台通过商品和匠人的 ID 来绑定不同的 AI 输入和输出

---

## 📊 当前实现分析

### 1. 文化故事功能

#### 数据流程
```
前端 product.html
  ↓ fetch(`/ai/narrative/product/${productId}?status=all`)
后端 worker-api/index.js (Line 1211-1280)
  ↓ SELECT ... FROM content_variants WHERE product_id = ? AND lang = ?
数据库 content_variants 表
  ↓ 返回该商品的所有文化故事
前端显示
```

#### 数据库表结构
```sql
CREATE TABLE IF NOT EXISTS content_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,  -- ✅ 有 product_id 字段
  type TEXT NOT NULL,         -- story/feature/heritage/usage
  content_json TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'zh',
  status TEXT DEFAULT 'draft',
  -- ... 其他字段
)
```

#### 后端查询逻辑（Line 1224-1243）
```javascript
let sql = `
  SELECT id, type, content_json, lang, status, version,
         created_by, reviewed_by, review_notes,
         view_count, like_count, created_at, updated_at, published_at,
         audio_key, audio_url, audio_duration, audio_size,
         video_key, video_url, video_duration, video_size, video_thumbnail,
         generation_status, generation_progress
  FROM content_variants
  WHERE product_id = ? AND lang = ?  -- ✅ 正确使用 product_id 过滤
`;
const params = [product_id, lang];

if (status !== 'all') {
  sql += ` AND status = ?`;
  params.push(status);
}

sql += ` ORDER BY created_at DESC`;

const rows = await query(env, sql, params);
```

**✅ 结论**：后端查询逻辑正确，使用 `product_id` 过滤。

---

### 2. 匠人对话功能

#### 数据流程
```
前端 artisan-chat-inline.js
  ↓ fetch(`/ai/artisan-chat`, { artisan_id, message, ... })
后端 worker-api/index.js (Line 940-970)
  ↓ ❌ 返回模拟响应，未查询数据库
前端显示
```

#### 当前实现（Line 940-970）
```javascript
// POST /ai/artisan-chat - 与匠人 AI 对话
if (pathname === "/ai/artisan-chat" && req.method === "POST") {
  try {
    const body = await readJson(req);
    const { artisan_id, message, session_id, language = 'zh', context } = body;

    if (!artisan_id || !message) {
      return withCors(
        errorResponse("missing artisan_id or message", 400),
        pickAllowedOrigin(req)
      );
    }

    // ❌ 这里可以调用 AI API（OpenAI、Claude 等）
    // ❌ 暂时返回一个模拟响应
    const response = {
      ok: true,
      reply: `您好！我是${context?.name_zh || '匠人'}。关于"${message}"，这是一个很好的问题。作为传统工艺的传承人，我很乐意与您分享我的经验和故事。`,
      session_id: session_id || `session_${Date.now()}`,
      artisan_id,
      timestamp: new Date().toISOString()
    };

    return withCors(
      jsonResponse(response),
      pickAllowedOrigin(req)
    );
  } catch (error) {
    console.error('Artisan chat error:', error);
    return withCors(
      errorResponse(error.message || "chat failed", 500),
      pickAllowedOrigin(req)
    );
  }
}
```

**❌ 问题 1**：`/ai/artisan-chat` 路由返回的是**硬编码的模拟响应**，没有：
1. 查询 `artisans` 表获取匠人信息
2. 查询 `artisan_voice` 表获取 AI 人格配置
3. 调用真实的 AI API（OpenAI/Claude）
4. 记录对话日志到 `artisan_agent_logs` 表

#### 正确的实现应该是（Line 732-850）
```javascript
// POST /ai/artisan-agent/reply - AI 对话接口
if (pathname === "/ai/artisan-agent/reply" && req.method === "POST") {
  try {
    const body = await readJson(req);
    const { artisan_id, question, lang = 'zh', session_id, user_id } = body;

    // ✅ 查询匠人信息
    const artisanRows = await query(env, `
      SELECT * FROM artisans WHERE id = ?
    `, [artisan_id]);

    if (!artisanRows || artisanRows.length === 0) {
      return withCors(errorResponse("artisan not found", 404), pickAllowedOrigin(req));
    }

    const artisan = artisanRows[0];

    // ✅ 查询 AI 配置
    const voiceRows = await query(env, `
      SELECT * FROM artisan_voice WHERE artisan_id = ? AND enabled = 1
    `, [artisan_id]);

    let voiceConfig = null;
    if (voiceRows && voiceRows.length > 0) {
      voiceConfig = voiceRows[0];
    } else {
      // 使用默认配置
      voiceConfig = getDefaultVoiceConfig(artisan);
    }

    // ✅ 构建 AI 提示词
    const systemPrompt = buildArtisanSystemPrompt(artisan, voiceConfig, lang);
    const messages = buildChatMessages(systemPrompt, voiceConfig, question);

    // ✅ 调用真实 AI API
    const provider = voiceConfig.model_config?.provider || 'openai';
    const apiKey = provider === 'claude' ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY;
    
    const aiResult = provider === 'claude'
      ? await callClaude(apiKey, messages, config)
      : await callOpenAI(apiKey, messages, config);

    // ✅ 记录对话日志
    await run(env, `
      INSERT INTO artisan_agent_logs (id, artisan_id, user_id, session_id, question, answer, lang, ...)
      VALUES (?, ?, ?, ?, ?, ?, ?, ...)
    `, [logId, artisan_id, user_id, session_id, question, aiResult.answer, lang, ...]);

    return withCors(jsonResponse({
      ok: true,
      answer: aiResult.answer,
      // ...
    }), pickAllowedOrigin(req));
  }
}
```

**❌ 问题 2**：前端调用的是 `/ai/artisan-chat`（模拟路由），而不是 `/ai/artisan-agent/reply`（真实路由）。

---

## 🐛 发现的问题

### 问题 1：匠人对话使用模拟 API ⭐ 严重
**位置**：
- 后端：`worker-api/index.js` Line 940-970
- 前端：`frontend/common/artisan-chat-inline.js` Line 515

**问题**：
- 前端调用 `/ai/artisan-chat`
- 后端返回硬编码的模拟响应
- 没有查询 `artisans` 表和 `artisan_voice` 表
- 没有调用真实 AI API
- 所有匠人返回相同的模板回复

**影响**：
- ❌ 所有匠人的对话内容相同
- ❌ 无法体现不同匠人的个性和专业知识
- ❌ 没有使用后台配置的 AI 人格

---

### 问题 2：文化故事可能的数据混淆 ⚠️ 需验证
**可能原因**：
1. **数据库中没有数据**：`content_variants` 表为空或只有少量数据
2. **product_id 不匹配**：生成文化故事时使用了错误的 `product_id`
3. **前端传递错误的 product_id**：URL 参数解析问题

**需要验证**：
```sql
-- 检查 content_variants 表中的数据
SELECT product_id, COUNT(*) as count, GROUP_CONCAT(DISTINCT type) as types
FROM content_variants
GROUP BY product_id;

-- 检查是否有多个商品共享同一个 product_id
SELECT product_id, COUNT(*) as narrative_count
FROM content_variants
GROUP BY product_id
HAVING narrative_count > 0;
```

---

## ✅ 修复方案

### 修复 1：替换模拟 API 为真实 AI 对话 ⭐ 优先级最高

#### 步骤 1：修改前端调用
```javascript
// frontend/common/artisan-chat-inline.js
// Line 515: 修改 API 端点
const response = await fetch(`${API_BASE}/ai/artisan-agent/reply`, {  // 修改这里
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    artisan_id: chat.artisanId,
    question: userMessage,  // 修改参数名：message → question
    session_id: chat.sessionId,
    language: chat.currentLang,  // 修改参数名：language → lang
    user_id: null  // 可选：添加用户 ID
  })
});
```

#### 步骤 2：删除或标记模拟 API
```javascript
// worker-api/index.js
// Line 940-970: 删除或注释掉模拟路由

// ❌ 删除这个模拟路由
// if (pathname === "/ai/artisan-chat" && req.method === "POST") {
//   // ... 模拟响应
// }

// ✅ 或者添加警告
if (pathname === "/ai/artisan-chat" && req.method === "POST") {
  console.warn('⚠️ 使用了已废弃的模拟 API，请使用 /ai/artisan-agent/reply');
  return withCors(
    errorResponse("This endpoint is deprecated. Use /ai/artisan-agent/reply instead.", 410),
    pickAllowedOrigin(req)
  );
}
```

---

### 修复 2：添加数据隔离验证

#### 步骤 1：在文化故事 API 添加日志
```javascript
// worker-api/index.js
// Line 1243 之后添加
const rows = await query(env, sql, params);

// ✅ 添加日志验证
console.log(`📖 [Cultural Story] product_id: ${product_id}, found ${rows?.length || 0} narratives`);
if (rows && rows.length > 0) {
  console.log(`📖 [Cultural Story] Types: ${rows.map(r => r.type).join(', ')}`);
}
```

#### 步骤 2：在匠人对话 API 添加日志
```javascript
// worker-api/index.js
// Line 759 之后添加
const artisanRows = await query(env, `
  SELECT * FROM artisans WHERE id = ?
`, [artisan_id]);

// ✅ 添加日志验证
console.log(`💬 [Artisan Chat] artisan_id: ${artisan_id}, found: ${artisanRows?.length > 0}`);
if (artisanRows && artisanRows.length > 0) {
  console.log(`💬 [Artisan Chat] Artisan: ${artisanRows[0].name_zh || artisanRows[0].name_en}`);
}
```

---

### 修复 3：前端添加 ID 验证

#### 步骤 1：验证 product_id
```javascript
// frontend/product.html
// Line 981 之前添加
async function loadCulturalNarratives(productId, inline = false) {
  // ✅ 验证 product_id
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.error('❌ Invalid product_id:', productId);
    alert('商品 ID 无效');
    return;
  }
  
  console.log(`📖 Loading cultural narratives for product: ${productId}`);
  
  try {
    const response = await fetch(`${API_BASE}/ai/narrative/product/${productId}?status=all`);
    // ...
  }
}
```

#### 步骤 2：验证 artisan_id
```javascript
// frontend/common/artisan-chat-inline.js
// Line 515 之前添加
async function sendToAPI(containerId, userMessage) {
  const chat = activeChats.get(containerId);
  if (!chat) return;
  
  // ✅ 验证 artisan_id
  if (!chat.artisanId || chat.artisanId === 'undefined' || chat.artisanId === 'null') {
    console.error('❌ Invalid artisan_id:', chat.artisanId);
    addMessage(containerId, 'system', '匠人 ID 无效，无法发送消息');
    return;
  }
  
  console.log(`💬 Sending message to artisan: ${chat.artisanId}`);
  
  showTypingIndicator(containerId);
  
  try {
    const response = await fetch(`${API_BASE}/ai/artisan-agent/reply`, {
      // ...
    });
  }
}
```

---

## 🔧 数据库检查脚本

### 检查文化故事数据分布
```sql
-- 1. 检查每个商品的文化故事数量
SELECT 
  p.id as product_id,
  p.name_zh as product_name,
  COUNT(cv.id) as narrative_count,
  GROUP_CONCAT(DISTINCT cv.type) as narrative_types
FROM products_new p
LEFT JOIN content_variants cv ON p.id = cv.product_id
GROUP BY p.id
ORDER BY narrative_count DESC;

-- 2. 检查是否有重复的文化故事
SELECT 
  product_id,
  type,
  lang,
  COUNT(*) as count
FROM content_variants
GROUP BY product_id, type, lang
HAVING count > 1;

-- 3. 检查文化故事的状态分布
SELECT 
  status,
  COUNT(*) as count
FROM content_variants
GROUP BY status;
```

### 检查匠人 AI 配置
```sql
-- 1. 检查每位匠人的 AI 配置
SELECT 
  a.id as artisan_id,
  a.name_zh as artisan_name,
  av.tone_style,
  av.enabled,
  CASE WHEN av.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_ai_config
FROM artisans a
LEFT JOIN artisan_voice av ON a.id = av.artisan_id
ORDER BY a.name_zh;

-- 2. 检查匠人对话日志
SELECT 
  artisan_id,
  COUNT(*) as conversation_count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM artisan_agent_logs
GROUP BY artisan_id
ORDER BY conversation_count DESC;
```

---

## 📋 修复优先级

### P0 - 立即修复（影响核心功能）
1. ✅ **修复匠人对话 API**：将 `/ai/artisan-chat` 替换为 `/ai/artisan-agent/reply`
2. ✅ **添加前端 ID 验证**：防止传递无效的 ID

### P1 - 尽快修复（影响用户体验）
3. ✅ **添加数据隔离日志**：验证每个请求使用正确的 ID
4. ✅ **运行数据库检查脚本**：确认数据分布正常

### P2 - 优化改进（提升可维护性）
5. ⚪ **添加 API 文档**：明确每个 API 的数据来源和隔离规则
6. ⚪ **添加单元测试**：验证数据隔离逻辑
7. ⚪ **添加监控告警**：检测数据混淆问题

---

## 🎯 预期结果

修复后：
- ✅ 每个商品显示其专属的文化故事（通过 `product_id` 绑定）
- ✅ 每位匠人的对话体现其独特的个性和专业知识（通过 `artisan_id` 和 `artisan_voice` 绑定）
- ✅ 后台生成的 AI 内容正确关联到对应的商品/匠人
- ✅ 日志清晰显示每次请求使用的 ID 和返回的数据

---

**审计日期**：2025-11-02  
**审计人**：AI Assistant  
**状态**：🔍 审计中 → 待修复

