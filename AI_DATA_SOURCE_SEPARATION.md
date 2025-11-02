# AI 数据源分离架构设计

## 核心原则：数据不污染

### 1. 匠人对话 AI（Artisan Chat AI）
**用途**：用户与传承人的虚拟对话交互

**数据来源**：
- **主表**：`artisans`（传承人管理表）
- **字段**：
  - `name_zh`, `name_en` - 匠人姓名
  - `bio_zh`, `bio_en` - 匠人简介
  - `specialty_zh`, `specialty_en` - 专长领域
  - `region` - 地域
  - `avatar` - 头像
  - `story_zh`, `story_en` - 个人故事
  - `achievements` - 成就

**AI Prompt 构建**：
```javascript
// 仅使用 artisans 表的数据
const artisanPrompt = `
你是一位传统工艺传承人：${artisan.name_zh}
专长：${artisan.specialty_zh}
地域：${artisan.region}
个人故事：${artisan.story_zh}
成就：${artisan.achievements}

请以第一人称回答用户关于你的技艺、经历、传承故事的问题。
`;
```

**API 路由**：
- `POST /ai/artisan-chat` - 匠人对话
- 输入：`artisan_id`, `message`, `session_id`
- 输出：AI 生成的匠人回复

**前端调用**：
- `frontend/common/artisan-chat-inline.js`
- `frontend/product.html` - 产品详情页的匠人对话卡片
- `frontend/admin/artisans.html` - 管理员测试匠人对话

---

### 2. 商品文化故事 AI（Product Cultural Narrative AI）
**用途**：为商品生成文化背景、工艺介绍、历史故事

**数据来源**：
- **主表**：`products_new`（商品表）
- **字段**：
  - `title_zh`, `title_en` - 商品名称
  - `description_zh`, `description_en` - 商品描述
  - `category` - 类别
  - `materials` - 材质
  - `craftsmanship` - 工艺
  - `cultural_background` - 文化背景
  - `historical_context` - 历史背景
  - `symbolic_meaning` - 象征意义

**AI Prompt 构建**：
```javascript
// 仅使用 products_new 表的数据
const productPrompt = `
商品名称：${product.title_zh}
类别：${product.category}
材质：${product.materials}
工艺：${product.craftsmanship}
文化背景：${product.cultural_background}
历史背景：${product.historical_context}
象征意义：${product.symbolic_meaning}

请围绕这件商品，生成一段文化故事，介绍其背后的文化内涵、工艺特色、历史渊源。
`;
```

**AI 生成类型**：
- `cultural_story` - 文化故事
- `craftsmanship_intro` - 工艺介绍
- `historical_background` - 历史背景
- `symbolic_meaning` - 象征意义解读
- `usage_guide` - 使用指南

**API 路由**：
- `POST /ai/narrative/generate` - 生成商品文化叙事
- `GET /ai/narrative/product/:product_id` - 获取商品所有叙事版本
- 输入：`product_id`, `types[]`, `lang`, `generate_audio`, `generate_video`
- 输出：生成的文化叙事（文本/音频/视频）

**存储表**：
- `content_variants` - 存储生成的叙事内容
  - `product_id` - 关联商品 ID
  - `type` - 叙事类型
  - `content_json` - 叙事内容（JSON）
  - `audio_url`, `video_url` - 多媒体资源
  - `status` - 状态（draft/published）

**前端调用**：
- `frontend/admin/narrative-generator.html` - 管理员生成文化故事
- `frontend/product.html` - 产品详情页的"了解文化故事"功能

---

## 数据隔离检查清单

### ✅ 正确的数据使用
1. **匠人对话**：
   - ✅ 使用 `artisans` 表的 `bio`, `story`, `specialty`, `achievements`
   - ✅ 对话围绕"人物"展开
   - ✅ 第一人称回答

2. **商品文化故事**：
   - ✅ 使用 `products_new` 表的 `description`, `cultural_background`, `materials`, `craftsmanship`
   - ✅ 叙事围绕"商品"展开
   - ✅ 第三人称叙述

### ❌ 禁止的数据混用
1. **匠人对话**中：
   - ❌ 不能使用商品的 `description`, `materials`, `craftsmanship`
   - ❌ 不能让匠人介绍具体商品（除非商品表中有 `artisan_id` 关联）

2. **商品文化故事**中：
   - ❌ 不能使用匠人的 `bio`, `story`, `achievements`
   - ❌ 不能在故事中虚构匠人信息

### 🔗 允许的关联
如果商品表有 `artisan_id` 字段：
- ✅ 商品文化故事可以提及"由传承人 XXX 制作"
- ✅ 但仅限于引用匠人的姓名和基本信息，不能深入其个人故事

---

## 实现建议

### 后端 AI 调用函数分离

#### 1. 匠人对话 AI 函数
```javascript
// worker-api/utils/ai-artisan-chat.js
async function generateArtisanReply(artisan, userMessage, conversationHistory) {
  const systemPrompt = buildArtisanSystemPrompt(artisan);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];
  
  return await callOpenAI(messages, { temperature: 0.8, max_tokens: 500 });
}

function buildArtisanSystemPrompt(artisan) {
  return `你是传统工艺传承人${artisan.name_zh}。
专长：${artisan.specialty_zh}
地域：${artisan.region}
个人故事：${artisan.story_zh}
成就：${artisan.achievements}

请以第一人称回答用户问题，分享你的技艺、经历和传承故事。`;
}
```

#### 2. 商品文化故事 AI 函数
```javascript
// worker-api/utils/ai-product-narrative.js
async function generateProductNarrative(product, narrativeType, lang = 'zh') {
  const systemPrompt = buildProductSystemPrompt(product, narrativeType, lang);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请生成${narrativeType}` }
  ];
  
  return await callOpenAI(messages, { temperature: 0.7, max_tokens: 1000 });
}

function buildProductSystemPrompt(product, narrativeType, lang) {
  const prompts = {
    cultural_story: `围绕商品"${product.title_zh}"，基于以下信息生成文化故事：
文化背景：${product.cultural_background}
历史背景：${product.historical_context}
象征意义：${product.symbolic_meaning}`,
    
    craftsmanship_intro: `介绍商品"${product.title_zh}"的工艺特色：
材质：${product.materials}
工艺：${product.craftsmanship}`,
    
    // ... 其他类型
  };
  
  return prompts[narrativeType] || prompts.cultural_story;
}
```

---

## 前端调用示例

### 匠人对话
```javascript
// frontend/common/artisan-chat-inline.js
async function sendToAPI(artisanId, message, sessionId) {
  const response = await fetch(`${API_BASE}/ai/artisan-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artisan_id: artisanId,  // 仅传递匠人 ID
      message: message,
      session_id: sessionId,
      language: currentLang
    })
  });
  return await response.json();
}
```

### 商品文化故事
```javascript
// frontend/admin/narrative-generator.html
async function generateNarratives() {
  const response = await fetch(`${API_BASE}/ai/narrative/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      product_id: currentProductId,  // 仅传递商品 ID
      types: ['cultural_story', 'craftsmanship_intro'],
      lang: 'zh',
      generate_audio: true,
      generate_video: false
    })
  });
  return await response.json();
}
```

---

## 数据库表结构建议

### artisans 表（匠人）
```sql
CREATE TABLE artisans (
  id TEXT PRIMARY KEY,
  name_zh TEXT NOT NULL,
  name_en TEXT,
  bio_zh TEXT,           -- 简介（用于 AI）
  bio_en TEXT,
  specialty_zh TEXT,     -- 专长（用于 AI）
  specialty_en TEXT,
  region TEXT,           -- 地域（用于 AI）
  avatar TEXT,
  story_zh TEXT,         -- 个人故事（用于 AI）
  story_en TEXT,
  achievements TEXT,     -- 成就（用于 AI）
  created_at INTEGER,
  updated_at INTEGER
);
```

### products_new 表（商品）
```sql
CREATE TABLE products_new (
  id TEXT PRIMARY KEY,
  title_zh TEXT NOT NULL,
  title_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  category TEXT,
  materials TEXT,              -- 材质（用于 AI）
  craftsmanship TEXT,          -- 工艺（用于 AI）
  cultural_background TEXT,    -- 文化背景（用于 AI）
  historical_context TEXT,     -- 历史背景（用于 AI）
  symbolic_meaning TEXT,       -- 象征意义（用于 AI）
  artisan_id TEXT,             -- 可选：关联匠人
  price REAL,
  stock INTEGER,
  image_key TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id)
);
```

### content_variants 表（商品文化叙事）
```sql
CREATE TABLE content_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,    -- 关联商品（不关联匠人）
  type TEXT NOT NULL,          -- cultural_story, craftsmanship_intro, etc.
  content_json TEXT,           -- 叙事内容
  lang TEXT DEFAULT 'zh',
  status TEXT DEFAULT 'draft', -- draft, published
  audio_url TEXT,
  video_url TEXT,
  created_at INTEGER,
  FOREIGN KEY (product_id) REFERENCES products_new(id)
);
```

---

## 总结

### 数据源分离原则
1. **匠人对话 AI** = `artisans` 表数据 → 围绕"人物"
2. **商品文化故事 AI** = `products_new` 表数据 → 围绕"商品"
3. **严禁混用**：两个 AI 系统的数据源完全独立
4. **允许关联**：通过 `artisan_id` 外键，商品可以引用匠人姓名

### 实现检查点
- ✅ 后端 API 路由分离（`/ai/artisan-chat` vs `/ai/narrative/generate`）
- ✅ AI Prompt 构建函数分离
- ✅ 数据库查询分离（不同的表）
- ✅ 前端调用分离（不同的组件和页面）
- ✅ 存储分离（匠人对话不持久化，商品叙事存入 `content_variants`）

---

**修订日期**：2025-11-02
**版本**：1.0

