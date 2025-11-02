# 文化故事 API 调试指南

## 🔍 问题描述

**用户报告**：在 `/admin` 页面生成了匠人和商品的文化故事，但在前端的商品详情页没有调用成功。

---

## 📊 数据流程

```
前端 product.html
  ↓ 用户点击"了解文化故事"按钮
  ↓ toggleCulturalNarratives(productId)
  ↓ loadCulturalNarratives(productId, inline=true)
  ↓ fetch(`${API_BASE}/ai/narrative/product/${productId}?status=all`)
后端 worker-api/index.js
  ↓ GET /ai/narrative/product/:product_id
  ↓ SELECT ... FROM content_variants WHERE product_id = ? AND lang = ?
数据库 content_variants 表
  ↓ 返回该商品的所有文化故事
前端显示
```

---

## 🐛 可能的问题

### 问题 1：数据库中没有数据
**症状**：API 返回 `{ ok: true, narratives: [] }`

**检查方法**：
```sql
-- 检查 content_variants 表中的数据
SELECT product_id, type, lang, status, created_at
FROM content_variants
ORDER BY created_at DESC
LIMIT 20;

-- 检查特定商品的文化故事
SELECT *
FROM content_variants
WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5'
ORDER BY created_at DESC;
```

**解决方案**：
1. 进入 `/admin/narrative-generator.html`
2. 选择商品
3. 选择叙事类型（story, feature, heritage, usage）
4. 点击"生成叙事"

---

### 问题 2：product_id 不匹配
**症状**：API 返回 `{ ok: true, narratives: [] }`，但数据库中有数据

**检查方法**：
```javascript
// 前端控制台
console.log('Current product_id:', getUrlParameter('id'));

// 对比数据库中的 product_id
SELECT DISTINCT product_id FROM content_variants;
```

**可能原因**：
- URL 中的 `id` 参数格式不正确
- 数据库中存储的 `product_id` 格式不一致

**解决方案**：
```sql
-- 更新 product_id 格式（如果需要）
UPDATE content_variants
SET product_id = 'id_19a28fd0a18_47a42e7525ca5'
WHERE product_id = 'old_format_id';
```

---

### 问题 3：API 路由未匹配
**症状**：API 返回 404 或 400

**检查方法**：
```bash
# 查看 Worker 日志
cd worker-api
npx wrangler tail --format pretty

# 手动测试 API
curl "https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/product/id_19a28fd0a18_47a42e7525ca5?status=all"
```

**预期响应**：
```json
{
  "ok": true,
  "narratives": [
    {
      "id": "nrt_xxx",
      "type": "story",
      "content": "...",
      "audio_url": "/r2/narratives/audio/xxx.mp3",
      "video_url": "/r2/narratives/video/xxx.mp4"
    }
  ]
}
```

---

### 问题 4：CORS 错误
**症状**：浏览器控制台显示 CORS 错误

**检查方法**：
```javascript
// 浏览器控制台
// 查看 Network 标签，检查 Response Headers
// 应该包含：
// Access-Control-Allow-Origin: https://10break.com
```

**解决方案**：
```javascript
// worker-api/index.js
// 确保当前域名在白名单中
const allowedOrigins = [
  "https://10break.com",
  "https://870264e1.poap-checkin-frontend.pages.dev",
  // ...
];
```

---

### 问题 5：前端 API_BASE 配置错误
**症状**：请求发送到错误的域名

**检查方法**：
```javascript
// 浏览器控制台
console.log('API_BASE:', API_BASE);
// 应该输出：https://songbrocade-api.petterbrand03.workers.dev
```

**解决方案**：
```javascript
// frontend/product.html
// 确保正确引入 auth.js
const auth = window.authModule;
const API_BASE = auth.getAPIBase();
```

---

## 🔧 调试步骤

### 步骤 1：检查前端日志

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 刷新商品详情页
4. 点击"了解文化故事"按钮
5. 查看控制台输出

**预期日志**：
```
📖 Loading cultural narratives for product: id_19a28fd0a18_47a42e7525ca5
📖 API URL: https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/product/id_19a28fd0a18_47a42e7525ca5?status=all
📖 Response status: 200
📖 Response data: { ok: true, narratives: [...] }
✅ Found 4 narratives
```

**如果看到错误**：
```
❌ API error: 400 {"ok":false,"error":"missing product_id"}
```
→ product_id 提取失败，检查 URL 格式

```
❌ API error: 404 Not Found
```
→ API 路由未匹配，检查后端代码

```
⚠️ No narratives found or data.ok is false
```
→ 数据库中没有数据，需要在后台生成

---

### 步骤 2：检查后端日志

```bash
cd worker-api
npx wrangler tail --format pretty
```

**预期日志**：
```
📖 [Cultural Story] product_id: id_19a28fd0a18_47a42e7525ca5, lang: zh, status: all, found 4 narratives
📖 [Cultural Story] Types: story, feature, heritage, usage
📖 [Cultural Story] IDs: nrt_mhd7ump1h54b0x1q, nrt_mhd7ump1h54b0x2r, nrt_mhd7ump1h54b0x3s...
```

**如果看到**：
```
⚠️ [Cultural Story] No narratives found for product id_19a28fd0a18_47a42e7525ca5
```
→ 数据库中没有该商品的文化故事

---

### 步骤 3：检查数据库

```bash
# 连接到 D1 数据库
cd worker-api
npx wrangler d1 execute poap-db --command="SELECT product_id, type, lang, status, created_at FROM content_variants ORDER BY created_at DESC LIMIT 10;"
```

**预期输出**：
```
product_id                        | type     | lang | status    | created_at
----------------------------------|----------|------|-----------|------------
id_19a28fd0a18_47a42e7525ca5     | story    | zh   | published | 1730534400
id_19a28fd0a18_47a42e7525ca5     | feature  | zh   | draft     | 1730534401
id_19a3e5cfcb5_a0b75a456ce08     | story    | zh   | published | 1730534402
```

**如果输出为空**：
→ 数据库中没有数据，需要在后台生成

---

### 步骤 4：手动测试 API

```bash
# 测试 API 是否正常工作
curl -v "https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/product/id_19a28fd0a18_47a42e7525ca5?status=all"
```

**预期响应**：
```json
{
  "ok": true,
  "narratives": [
    {
      "id": "nrt_mhd7ump1h54b0x1q",
      "type": "story",
      "content": "这款【金凤织锦】手袋...",
      "lang": "zh",
      "status": "published",
      "audio_url": "/r2/narratives/audio/nrt_mhd7ump1h54b0x1q.mp3",
      "video_url": null
    }
  ]
}
```

---

## ✅ 解决方案总结

### 方案 1：数据库中没有数据（最常见）

**步骤**：
1. 访问 `/admin/narrative-generator.html`
2. 在"商品选择"下拉框中选择商品
3. 选择叙事类型（建议全选）：
   - ✅ 故事版 (story)
   - ✅ 特点版 (feature)
   - ✅ 传承版 (heritage)
   - ✅ 使用版 (usage)
4. 点击"生成叙事"按钮
5. 等待生成完成（可能需要 30-60 秒）
6. 刷新商品详情页，再次点击"了解文化故事"

---

### 方案 2：product_id 格式不一致

**检查**：
```sql
-- 检查商品表中的 ID 格式
SELECT id, name_zh FROM products_new LIMIT 10;

-- 检查文化故事表中的 product_id 格式
SELECT DISTINCT product_id FROM content_variants;
```

**如果格式不一致**：
```sql
-- 更新 content_variants 表中的 product_id
UPDATE content_variants
SET product_id = (
  SELECT id FROM products_new 
  WHERE products_new.name_zh = content_variants.product_id
  OR products_new.id = content_variants.product_id
)
WHERE product_id NOT LIKE 'id_%';
```

---

### 方案 3：前端缓存问题

**步骤**：
1. 强制刷新页面（Cmd/Ctrl + Shift + R）
2. 清除浏览器缓存
3. 使用无痕模式测试

---

## 📋 快速检查清单

- [ ] 数据库中有该商品的文化故事数据
- [ ] product_id 格式一致（前端 URL 参数 vs 数据库）
- [ ] API 路由正常工作（curl 测试）
- [ ] CORS 配置正确（浏览器 Network 标签）
- [ ] 前端 API_BASE 配置正确
- [ ] 浏览器控制台没有 JavaScript 错误
- [ ] Worker 日志显示正确的 product_id

---

## 🎯 当前部署状态

- **前端**：https://870264e1.poap-checkin-frontend.pages.dev
- **后端**：https://songbrocade-api.petterbrand03.workers.dev
- **Worker 版本**：5f9edf29-3b1d-411b-8645-97b034aa50b7
- **部署时间**：2025-11-02

---

## 📞 如何报告问题

如果问题仍然存在，请提供以下信息：

1. **商品 URL**：
   ```
   https://10break.com/product?id=id_19a28fd0a18_47a42e7525ca5
   ```

2. **浏览器控制台日志**：
   ```
   📖 Loading cultural narratives for product: ...
   📖 API URL: ...
   📖 Response status: ...
   ❌ API error: ...
   ```

3. **Worker 日志**（运行 `wrangler tail`）：
   ```
   📖 [Cultural Story] product_id: ..., found X narratives
   ```

4. **数据库查询结果**：
   ```sql
   SELECT * FROM content_variants WHERE product_id = 'your_product_id';
   ```

---

**最后更新**：2025-11-02  
**状态**：✅ 已添加详细日志，等待用户测试

