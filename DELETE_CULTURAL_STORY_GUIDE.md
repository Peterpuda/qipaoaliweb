# 删除商品文化故事指南

## 📍 删除位置

有两种方式删除商品的文化故事：

---

## 方式 1：通过 Admin 页面删除（推荐）✅

### 步骤

1. **访问文化叙事生成工具**
   ```
   https://dce3c9ef.poap-checkin-frontend.pages.dev/admin/narrative-generator.html
   ```
   或者
   ```
   https://10break.com/admin/narrative-generator.html
   ```

2. **连接钱包登录**
   - 点击页面右上角的钱包连接按钮
   - 使用管理员钱包登录

3. **选择商品**
   - 在"选择商品"下拉菜单中，选择要删除文化故事的商品
   - 例如：选择商品 ID `id_19a28fd0a18_47a42e7525ca5`

4. **查看已生成的叙事历史**
   - 页面会自动加载该商品的所有文化故事
   - 显示在"📚 已生成的叙事历史"区域

5. **点击"删除"按钮**
   - 找到要删除的文化故事
   - 点击右侧的"删除"按钮（红色文字）
   - 确认删除操作

6. **确认删除**
   - 弹出确认对话框："确定要删除这个叙事版本吗？"
   - 点击"确定"

7. **删除成功**
   - 显示"✅ 删除成功！"
   - 页面自动刷新，该文化故事消失

---

## 方式 2：通过数据库直接删除

### 使用 Wrangler CLI

```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api

# 1. 查看该商品的所有文化故事
npx wrangler d1 execute poap-db --remote --command \
  "SELECT id, product_id, type, lang, status, created_at FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5'"

# 2. 删除特定的文化故事（使用上面查询到的 id）
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE id = 'nrt_mhd7wf2sg5xxs7e2'"

# 3. 删除该商品的所有文化故事（⚠️ 谨慎使用）
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5'"
```

---

## 📊 删除操作详解

### Admin 页面删除流程

```
用户点击"删除" 
  ↓
前端发送 DELETE 请求
  ↓
后端验证管理员权限
  ↓
执行 SQL: DELETE FROM content_variants WHERE id = ?
  ↓
返回成功响应
  ↓
前端刷新列表
```

### API 端点

**请求**：
```
DELETE /admin/narrative/:narrative_id
Headers:
  Authorization: Bearer <token>
```

**响应**：
```json
{
  "ok": true,
  "narrative_id": "nrt_mhd7wf2sg5xxs7e2"
}
```

---

## 🔍 查询商品的文化故事

### 方式 1：通过 Admin 页面查看

1. 访问 `/admin/narrative-generator.html`
2. 选择商品
3. 查看"📚 已生成的叙事历史"区域

### 方式 2：通过数据库查询

```bash
# 查询特定商品的所有文化故事
npx wrangler d1 execute poap-db --remote --command \
  "SELECT id, type, lang, status, audio_url, video_url, created_at 
   FROM content_variants 
   WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5' 
   ORDER BY created_at DESC"
```

### 方式 3：通过 API 查询

```bash
# 查询所有状态的文化故事（需要管理员权限）
curl "https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/product/id_19a28fd0a18_47a42e7525ca5?status=all"

# 只查询已发布的文化故事（公开 API）
curl "https://songbrocade-api.petterbrand03.workers.dev/ai/narrative/product/id_19a28fd0a18_47a42e7525ca5?status=published"
```

---

## ⚠️ 注意事项

### 1. 删除是永久性的
- ✅ 删除后无法恢复
- ✅ 建议在删除前先确认是否真的需要删除

### 2. 删除不会影响 R2 文件
- ⚠️ 删除数据库记录后，R2 中的音频/视频文件**不会自动删除**
- ⚠️ 这些文件会继续占用存储空间
- ✅ 如果需要，可以手动删除 R2 文件（见下文）

### 3. 删除后前端显示
- ✅ 删除后，商品详情页将不再显示该文化故事
- ✅ 如果删除了所有文化故事，会显示"暂无文化故事内容"

---

## 🗑️ 清理 R2 文件（可选）

如果你想同时删除 R2 中的音频/视频文件：

### 步骤 1：查询文件路径

```bash
npx wrangler d1 execute poap-db --remote --command \
  "SELECT audio_key, video_key FROM content_variants WHERE id = 'nrt_mhd7wf2sg5xxs7e2'"
```

### 步骤 2：删除 R2 文件

```bash
# 删除音频文件
npx wrangler r2 object delete poap-images narratives/audio/nrt_mhd7wf2sg5xxs7e2.mp3

# 删除视频文件（如果有）
npx wrangler r2 object delete poap-images narratives/video/nrt_mhd7wf2sg5xxs7e2.mp4
```

---

## 📋 常见场景

### 场景 1：删除某个商品的所有文化故事

**方法 1（推荐）**：通过 Admin 页面逐个删除
1. 访问 `/admin/narrative-generator.html`
2. 选择商品
3. 逐个点击"删除"按钮

**方法 2**：通过数据库批量删除
```bash
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5'"
```

---

### 场景 2：删除某个语言版本的文化故事

```bash
# 删除英文版本
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5' AND lang = 'en'"

# 删除中文版本
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5' AND lang = 'zh'"
```

---

### 场景 3：删除草稿状态的文化故事

```bash
# 删除所有草稿
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5' AND status = 'draft'"
```

---

### 场景 4：只保留最新的一个版本

```bash
# 1. 查询所有版本，按时间倒序
npx wrangler d1 execute poap-db --remote --command \
  "SELECT id, created_at FROM content_variants WHERE product_id = 'id_19a28fd0a18_47a42e7525ca5' ORDER BY created_at DESC"

# 2. 删除旧版本（保留第一个，删除其他）
# 手动删除每个旧版本的 ID
npx wrangler d1 execute poap-db --remote --command \
  "DELETE FROM content_variants WHERE id = 'nrt_xxx'"
```

---

## 🔧 故障排除

### 删除失败：权限不足

**错误信息**：
```
删除失败: not allowed
```

**解决方案**：
1. 确认使用的是管理员钱包
2. 检查钱包地址是否在 `ADMIN_WALLETS` 环境变量中
3. 重新连接钱包

---

### 删除后前端依然显示

**原因**：浏览器缓存

**解决方案**：
1. 强制刷新页面（Cmd/Ctrl + Shift + R）
2. 清除浏览器缓存
3. 使用无痕模式测试

---

### 数据库删除失败

**错误信息**：
```
Error: no such table: content_variants
```

**解决方案**：
1. 确认数据库名称正确（`poap-db`）
2. 确认表已创建（运行 migration）
3. 使用 `--remote` 参数连接远程数据库

---

## 📊 数据库表结构

```sql
CREATE TABLE content_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  type TEXT NOT NULL,
  lang TEXT NOT NULL,
  status TEXT NOT NULL,
  content_json TEXT NOT NULL,
  audio_key TEXT,
  audio_url TEXT,
  audio_duration INTEGER DEFAULT 0,
  audio_size INTEGER DEFAULT 0,
  video_key TEXT,
  video_url TEXT,
  video_duration INTEGER DEFAULT 0,
  video_size INTEGER DEFAULT 0,
  video_thumbnail TEXT,
  generation_status TEXT DEFAULT 'pending',
  generation_progress TEXT,
  created_by TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER
);
```

---

## 🎯 推荐做法

### 删除前
1. ✅ 确认要删除的文化故事 ID
2. ✅ 备份重要数据（如果需要）
3. ✅ 确认删除原因

### 删除时
1. ✅ 优先使用 Admin 页面删除（更安全）
2. ✅ 逐个删除，避免误删
3. ✅ 确认删除操作

### 删除后
1. ✅ 刷新前端页面，确认删除成功
2. ✅ 检查商品详情页是否正常
3. ✅ 如果需要，清理 R2 文件

---

## 📞 需要帮助？

如果删除过程中遇到问题，请提供：
1. 要删除的商品 ID
2. 要删除的文化故事 ID
3. 错误信息（如果有）
4. 操作步骤

我会立即帮你解决！

