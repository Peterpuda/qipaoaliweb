# AI 数据来源分离修复方案

## 🎯 问题分析

### 当前问题

**文化故事 AI** 的数据来源混乱：
1. ❌ 使用了匠人的名字（但实际上是商品的名字）
2. ❌ Prompt 中以匠人的口吻讲述（"你是 XXX 匠人"）
3. ❌ 混合了商品数据和匠人数据

**正确的数据分离**：
- ✅ **文化故事 AI**：只使用商品数据，讲述商品的文化含义
- ✅ **匠人对话 AI**：只使用匠人数据，以匠人的口吻对话

---

## 🔍 代码问题定位

### 问题 1：后端数据混乱

**文件**: `worker-api/index.js` (第 1026-1031 行)

```javascript
// ❌ 错误的代码
const artisanData = {
  id: productData.artisan_id,
  name_zh: productData.name_zh,  // ❌ 这是商品名，不是匠人名
  name_en: productData.name_en,  // ❌ 这是商品名，不是匠人名
  region: productData.region
};
```

**问题**：
- `productData.name_zh` 是商品的名字，不是匠人的名字
- 导致 AI 以为自己是商品，而不是匠人

---

### 问题 2：Prompt 设计不当

**文件**: `worker-api/utils/ai-helpers.js` (第 463-465 行)

```javascript
// ❌ 错误的 Prompt
let prompt = lang === 'zh'
  ? `你是 ${artisanName}，一位专注传统技艺的匠人。现在需要为你的作品《${productName}》撰写${type.name}文案。\n\n`
  : `You are ${artisanName}, a traditional artisan. Write a ${type.name} narrative for your work "${productName}".\n\n`;
```

**问题**：
- 文化故事应该**客观讲述商品的文化含义**
- 不应该以匠人的第一人称口吻
- 匠人信息不应该出现在文化故事的 Prompt 中

---

## 🛠️ 修复方案

### 方案 A：完全移除匠人数据（推荐）✅

**原则**：
- 文化故事 AI **只关注商品本身的文化含义**
- 不涉及匠人的个人信息
- 客观、专业的叙述方式

**修改内容**：
1. 移除 `artisanData` 参数
2. 重写 `buildNarrativeSystemPrompt`，只使用商品数据
3. 修改 Prompt，改为客观叙述

---

### 方案 B：保留匠人产地信息（折中）

**原则**：
- 文化故事可以提及产地（来自匠人数据）
- 但不以匠人的口吻讲述
- 匠人名字不出现在文化故事中

**修改内容**：
1. 保留 `artisanData.region`（产地）
2. 移除 `artisanData.name_zh/name_en`
3. 修改 Prompt，改为客观叙述

---

## ✅ 推荐修复（方案 A）

### 修改 1：后端数据查询

**文件**: `worker-api/index.js`

```javascript
// ✅ 修复后的代码
// 查询商品信息（不需要匠人信息）
const productRows = await query(env, `
  SELECT id, name_zh, name_en, desc_md, category, price_wei, image_key
  FROM products_new
  WHERE id = ?
`, [product_id]);

if (!productRows || productRows.length === 0) {
  return withCors(errorResponse("product not found", 404), pickAllowedOrigin(req));
}

const productData = productRows[0];

// ❌ 移除 artisanData 的构建

// 生成多种叙事版本（不传递 artisanData）
const results = await generateMultipleNarratives(
  apiKey,
  productData,
  null,  // ✅ 不传递匠人数据
  types,
  lang,
  provider
);
```

---

### 修改 2：AI Helper 函数签名

**文件**: `worker-api/utils/ai-helpers.js`

```javascript
// ✅ 修复后的函数签名
export function buildNarrativeSystemPrompt(productData, narrativeType, lang = 'zh') {
  // 移除 artisanData 参数
  // ...
}

export async function generateNarrative(apiKey, productData, narrativeType, lang = 'zh', provider = 'openai') {
  // 移除 artisanData 参数
  const systemPrompt = buildNarrativeSystemPrompt(productData, narrativeType, lang);
  // ...
}

export async function generateMultipleNarratives(apiKey, productData, types, lang = 'zh', provider = 'openai') {
  // 移除 artisanData 参数
  // ...
}
```

---

### 修改 3：重写 Prompt

**文件**: `worker-api/utils/ai-helpers.js`

```javascript
// ✅ 修复后的 Prompt
export function buildNarrativeSystemPrompt(productData, narrativeType, lang = 'zh') {
  const typeDescriptions = {
    zh: {
      story: {
        name: '故事版',
        desc: '讲述这件作品背后的文化故事和历史渊源',
        guidelines: [
          '客观专业的叙述方式',
          '聚焦商品的文化内涵和历史背景',
          '描述相关的传统技艺和工艺特点',
          '体现文化传承的价值和意义',
          '字数控制在 200-300 字'
        ]
      },
      feature: {
        name: '特点版',
        desc: '详细介绍这件作品的特色和工艺亮点',
        guidelines: [
          '客观专业的介绍方式',
          '突出独特的工艺技法',
          '说明材料的选择和特性',
          '强调细节和品质',
          '字数控制在 150-200 字'
        ]
      },
      heritage: {
        name: '传承版',
        desc: '阐述这件作品承载的文化传承和历史价值',
        guidelines: [
          '介绍相关的非遗技艺背景',
          '说明技艺的历史渊源',
          '体现文化传承的意义',
          '连接传统与现代',
          '字数控制在 200-250 字'
        ]
      },
      usage: {
        name: '使用版',
        desc: '说明这件作品的使用场景和保养方法',
        guidelines: [
          '实用性强的建议',
          '适用场景描述',
          '保养和维护方法',
          '注意事项提醒',
          '字数控制在 150-200 字'
        ]
      }
    },
    // ... 英文版本类似
  };

  const l = lang === 'zh' ? typeDescriptions.zh : typeDescriptions.en;
  const type = l[narrativeType] || l.story;
  
  const productName = lang === 'zh' ? productData.name_zh : productData.name_en;

  // ✅ 新的 Prompt：客观叙述，不涉及匠人
  let prompt = lang === 'zh'
    ? `请为《${productName}》这件传统手工艺品撰写${type.name}文案。\n\n`
    : `Write a ${type.name} narrative for the traditional craft "${productName}".\n\n`;

  prompt += lang === 'zh' ? `任务说明：\n${type.desc}\n\n` : `Task Description:\n${type.desc}\n\n`;
  
  prompt += lang === 'zh' ? `写作指南：\n` : `Writing Guidelines:\n`;
  type.guidelines.forEach((guideline, index) => {
    prompt += `${index + 1}. ${guideline}\n`;
  });

  // 添加商品基本信息
  prompt += lang === 'zh' ? `\n商品信息参考：\n` : `\nProduct Information Reference:\n`;
  
  if (productData.desc_md) {
    prompt += lang === 'zh' 
      ? `- 商品描述：${productData.desc_md}\n`
      : `- Description: ${productData.desc_md}\n`;
  }
  
  if (productData.category) {
    prompt += lang === 'zh'
      ? `- 类别：${productData.category}\n`
      : `- Category: ${productData.category}\n`;
  }

  prompt += lang === 'zh'
    ? `\n请直接输出文案内容，不要包含标题或其他额外说明。以客观、专业的方式讲述这件作品的文化价值。`
    : `\nPlease output the narrative content directly without title or additional explanation. Use an objective and professional tone to describe the cultural value of this piece.`;

  return prompt;
}
```

---

## 📊 数据流对比

### 修复前（错误）❌

```
商品详情页 → 后端 API
  ↓
查询商品 + 匠人（JOIN）
  ↓
artisanData = {
  name_zh: productData.name_zh  // ❌ 商品名
}
  ↓
Prompt: "你是 XXX（商品名），一位匠人..."  // ❌ 混乱
  ↓
生成文化故事（以商品的口吻？）
```

---

### 修复后（正确）✅

```
商品详情页 → 后端 API
  ↓
只查询商品数据
  ↓
productData = {
  name_zh: "商品名",
  desc_md: "商品描述",
  category: "类别"
}
  ↓
Prompt: "请为《商品名》这件传统手工艺品撰写文化故事..."  // ✅ 客观
  ↓
生成文化故事（客观叙述商品的文化价值）
```

---

## 🎯 两种 AI 的数据来源对比

### 文化故事 AI

**数据来源**：
- ✅ 商品名称（`products_new.name_zh/name_en`）
- ✅ 商品描述（`products_new.desc_md`）
- ✅ 商品类别（`products_new.category`）
- ❌ **不使用**匠人数据

**Prompt 风格**：
- ✅ 客观、专业的叙述
- ✅ 聚焦商品的文化含义
- ❌ 不以第一人称

**示例**：
> "这件苏绣作品《牡丹图》采用传统的双面绣技法，展现了江南刺绣的精湛工艺。牡丹作为富贵的象征，在中国传统文化中有着深厚的寓意..."

---

### 匠人对话 AI

**数据来源**：
- ✅ 匠人名字（`artisans.name_zh/name_en`）
- ✅ 匠人简介（`artisans.bio_zh/bio_en`）
- ✅ 匠人产地（`artisans.region`）
- ✅ AI 人格配置（`artisan_voice` 表）
- ❌ **不使用**商品数据

**Prompt 风格**：
- ✅ 第一人称（"我是 XXX 匠人"）
- ✅ 以匠人的口吻对话
- ✅ 体现匠人的个性和经验

**示例**：
> "我是李明，从事苏绣已经 30 年了。这门技艺是我从师傅那里学来的，每一针每一线都凝聚着我们对传统文化的敬意..."

---

## 🔧 实施步骤

### 步骤 1：修改后端 API

```bash
# 编辑 worker-api/index.js
# 1. 移除 artisanData 的构建（第 1026-1031 行）
# 2. 移除 generateMultipleNarratives 的 artisanData 参数（第 1051 行）
# 3. 简化商品查询（第 1006-1011 行）
```

### 步骤 2：修改 AI Helper

```bash
# 编辑 worker-api/utils/ai-helpers.js
# 1. 修改 buildNarrativeSystemPrompt 函数签名（第 361 行）
# 2. 重写 Prompt（第 463-496 行）
# 3. 修改 generateNarrative 函数签名（第 509 行）
# 4. 修改 generateMultipleNarratives 函数签名（第 544 行）
```

### 步骤 3：测试验证

```bash
# 1. 部署后端
cd worker-api
npx wrangler deploy

# 2. 测试生成文化故事
# 访问 /admin/narrative-generator.html
# 选择商品，生成文化故事
# 检查生成的内容是否客观、专业

# 3. 测试匠人对话
# 访问商品详情页
# 点击"与匠人对话"
# 检查对话是否以匠人的口吻
```

---

## 📋 验证清单

- [ ] 文化故事不再以匠人的口吻讲述
- [ ] 文化故事只包含商品的文化信息
- [ ] 文化故事不包含匠人的名字
- [ ] 匠人对话以第一人称（"我是 XXX"）
- [ ] 匠人对话只使用匠人数据
- [ ] 两种 AI 的数据完全分离

---

## 🎉 预期效果

### 文化故事（修复后）

**风格**：客观、专业、聚焦文化
**示例**：
> "《云锦龙袍》是一件采用南京云锦传统织造技艺制作的精品。云锦作为中国四大名锦之首，有着 1600 多年的历史。这件作品采用'妆花'工艺，使用金线和彩色丝线交织，展现了皇家服饰的华贵气质。龙纹图案象征着权力和尊贵，体现了中国传统文化中的等级观念和审美追求。"

---

### 匠人对话（保持不变）

**风格**：第一人称、个性化、经验分享
**示例**：
> "我是王师傅，从事云锦织造已经 40 年了。这门技艺是我从父亲那里学来的，每一道工序都需要极大的耐心和专注。你看这件龙袍，光是织造就花了 3 个月的时间，每一根金线的走向都要精确计算..."

---

## 📞 需要帮助？

如果在修复过程中遇到问题，请提供：
1. 修改的文件和行号
2. 错误信息（如果有）
3. 生成的文化故事示例

我会立即帮你解决！

