# AI 数据源审计清单

## 当前实现审计

### ✅ 已正确分离的部分

#### 1. 匠人对话 AI
- **路由**：`POST /ai/artisan-chat` ✅
- **数据来源**：`artisans` 表 ✅
- **前端组件**：
  - `frontend/common/artisan-chat-inline.js` ✅
  - `frontend/product.html` - 匠人对话卡片 ✅
  - `frontend/admin/artisans.html` - 管理测试 ✅
- **Prompt 构建**：基于 `artisan.name_zh`, `artisan.bio`, `artisan.specialty` ✅

#### 2. 商品文化故事 AI
- **路由**：
  - `POST /ai/narrative/generate` ✅
  - `GET /ai/narrative/product/:product_id` ✅
- **数据来源**：`products_new` 表 ✅
- **前端组件**：
  - `frontend/admin/narrative-generator.html` ✅
  - `frontend/product.html` - 文化故事卡片 ✅
- **存储表**：`content_variants` ✅

---

## ⚠️ 需要审查的部分

### 1. 商品文化故事生成 Prompt
**文件**：`worker-api/utils/ai-helpers.js` - `generateNarrative()` 函数

**需要检查**：
- [ ] Prompt 是否仅使用 `products_new` 表的字段？
- [ ] 是否避免引用 `artisans` 表的详细信息？
- [ ] 如果有 `artisan_id` 关联，是否仅引用匠人姓名？

**当前实现位置**：
```bash
grep -n "generateNarrative" worker-api/utils/ai-helpers.js
```

**建议修改**：
```javascript
// 修改前：可能混用了匠人详细信息
const prompt = `商品：${product.title_zh}，由传承人 ${artisan.name_zh} 制作，
${artisan.bio}，${artisan.story}...`; // ❌ 不应包含 artisan.bio, artisan.story

// 修改后：仅使用商品信息
const prompt = `商品：${product.title_zh}
类别：${product.category}
材质：${product.materials}
工艺：${product.craftsmanship}
文化背景：${product.cultural_background}
历史背景：${product.historical_context}
象征意义：${product.symbolic_meaning}

请生成文化故事。`; // ✅ 仅使用 products_new 表字段
```

---

### 2. 匠人对话 AI Prompt
**文件**：`worker-api/index.js` - `/ai/artisan-chat` 路由

**需要检查**：
- [ ] Prompt 是否仅使用 `artisans` 表的字段？
- [ ] 是否避免引用商品的详细信息？
- [ ] 如果用户问及商品，是否仅回答通用工艺知识？

**当前实现位置**：
```bash
grep -A 20 "/ai/artisan-chat" worker-api/index.js
```

**建议实现**：
```javascript
// 正确的匠人对话 Prompt
if (pathname === "/ai/artisan-chat" && req.method === "POST") {
  const body = await readJson(req);
  const { artisan_id, message } = body;
  
  // 1. 查询匠人信息（仅 artisans 表）
  const artisan = await query(env, `
    SELECT name_zh, bio_zh, specialty_zh, region, story_zh, achievements
    FROM artisans WHERE id = ?
  `, [artisan_id]);
  
  // 2. 构建 Prompt（仅使用匠人数据）
  const systemPrompt = `你是传统工艺传承人${artisan.name_zh}。
专长：${artisan.specialty_zh}
地域：${artisan.region}
个人故事：${artisan.story_zh}
成就：${artisan.achievements}

请以第一人称回答用户问题。`;
  
  // 3. 调用 AI（不查询 products_new 表）
  const reply = await callOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ]);
  
  return jsonResponse({ ok: true, reply });
}
```

---

### 3. 前端数据传递
**需要检查的文件**：
- `frontend/common/artisan-chat-inline.js`
- `frontend/admin/narrative-generator.html`
- `frontend/product.html`

**检查点**：
- [ ] 匠人对话是否仅传递 `artisan_id`？
- [ ] 商品文化故事是否仅传递 `product_id`？
- [ ] 是否避免在前端混合两种数据？

**示例审查**：
```javascript
// ✅ 正确：匠人对话仅传递 artisan_id
fetch('/ai/artisan-chat', {
  body: JSON.stringify({
    artisan_id: artisanId,
    message: userMessage
  })
});

// ✅ 正确：商品文化故事仅传递 product_id
fetch('/ai/narrative/generate', {
  body: JSON.stringify({
    product_id: productId,
    types: ['cultural_story']
  })
});

// ❌ 错误：混合传递
fetch('/ai/narrative/generate', {
  body: JSON.stringify({
    product_id: productId,
    artisan_id: artisanId,  // ❌ 不应传递
    artisan_bio: artisanBio // ❌ 不应传递
  })
});
```

---

## 审计步骤

### 步骤 1：检查后端 AI Prompt 构建
```bash
cd worker-api
grep -rn "generateNarrative" utils/
grep -rn "artisan.*story\|artisan.*bio" utils/
```

**预期结果**：
- `generateNarrative()` 函数不应查询或使用 `artisans` 表
- 匠人对话函数不应查询或使用 `products_new` 表

---

### 步骤 2：检查数据库查询
```bash
cd worker-api
grep -rn "SELECT.*FROM artisans" index.js utils/
grep -rn "SELECT.*FROM products_new" index.js utils/
```

**预期结果**：
- `/ai/artisan-chat` 路由仅查询 `artisans` 表
- `/ai/narrative/generate` 路由仅查询 `products_new` 表

---

### 步骤 3：检查前端数据传递
```bash
cd frontend
grep -rn "artisan_id.*product_id\|product_id.*artisan_id" .
```

**预期结果**：
- 不应在同一个 API 调用中同时传递 `artisan_id` 和 `product_id`
- 匠人对话组件不应访问商品数据
- 商品文化故事组件不应访问匠人详细数据

---

### 步骤 4：检查数据库表结构
```bash
cd worker-api
grep -rn "content_variants" migrations/
```

**预期结果**：
- `content_variants` 表应仅关联 `product_id`
- 不应有 `artisan_id` 字段（除非是通过 `products_new.artisan_id` 间接关联）

---

## 修复优先级

### P0（高优先级）- 必须立即修复
1. [ ] 检查 `generateNarrative()` 函数是否混用了 `artisans` 表数据
2. [ ] 检查 `/ai/artisan-chat` 是否混用了 `products_new` 表数据
3. [ ] 确保前端 API 调用不混合传递两种数据

### P1（中优先级）- 建议优化
1. [ ] 为 `products_new` 表添加更多 AI 友好字段：
   - `materials` - 材质
   - `craftsmanship` - 工艺
   - `cultural_background` - 文化背景
   - `historical_context` - 历史背景
   - `symbolic_meaning` - 象征意义
2. [ ] 为 `artisans` 表添加更多 AI 友好字段：
   - `story_zh`, `story_en` - 个人故事
   - `achievements` - 成就
   - `philosophy` - 工艺理念

### P2（低优先级）- 未来增强
1. [ ] 创建独立的 AI 配置表，存储每个匠人/商品的 AI 人格设定
2. [ ] 实现对话历史记录（仅匠人对话）
3. [ ] 实现叙事版本管理（仅商品文化故事）

---

## 验证测试

### 测试 1：匠人对话不应知道商品详情
**步骤**：
1. 打开商品详情页
2. 点击"与匠人对话"
3. 询问："这件商品的价格是多少？"

**预期结果**：
- ✅ 匠人回答："我主要专注于工艺传承，具体商品信息请查看商品详情。"
- ❌ 匠人回答："这件商品售价 XXX 元。"（说明数据污染）

---

### 测试 2：商品文化故事不应包含匠人详细故事
**步骤**：
1. 打开 `/admin/narrative-generator`
2. 选择一个商品
3. 生成"文化故事"

**预期结果**：
- ✅ 故事围绕商品的材质、工艺、文化背景展开
- ✅ 如果提及匠人，仅提及姓名和基本信息
- ❌ 故事包含匠人的详细个人经历、成就、故事（说明数据污染）

---

### 测试 3：API 调用数据隔离
**步骤**：
1. 打开浏览器开发者工具 - Network
2. 触发匠人对话
3. 检查 `/ai/artisan-chat` 请求 Payload

**预期结果**：
- ✅ Payload 仅包含：`artisan_id`, `message`, `session_id`
- ❌ Payload 包含：`product_id`, `product_description`（说明数据混用）

---

**审计日期**：2025-11-02
**审计人**：AI Assistant
**下次审计**：每次 AI 功能更新后

