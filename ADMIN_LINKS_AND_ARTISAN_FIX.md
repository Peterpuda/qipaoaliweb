# Admin 文件链接和匠人显示修复报告

## 🐛 问题描述

### 问题 1：Admin 生成的文件链接跳转回主页
**症状**：
- 在 `/admin/narrative-generator` 生成语音和视频后
- 点击"🎵 收听语音版"或"🎬 观看视频版"链接
- 页面跳转回主页，而不是播放文件

**根本原因**：
- 后端返回的 `audio_url` 和 `video_url` 是相对路径（如 `/r2/narratives/audio/xxx.mp3`）
- 在 admin 页面中，相对路径被解析为 `https://10break.com/admin/r2/...`（错误）
- 正确的应该是 `https://songbrocade-api.petterbrand03.workers.dev/r2/...`

---

### 问题 2：商品详情页显示"匠人不可用"
**症状**：
- 商品详情页显示"传统匠人"
- 按钮显示"不可用"
- 无法与匠人对话

**可能原因**：
1. 商品的 `artisan_id` 为空
2. `artisan_id` 与数据库中的匠人 ID 不匹配
3. API 返回的匠人列表中没有该 ID

---

## ✅ 修复内容

### 修复 1：Admin 文件链接（`frontend/admin/narrative-generator.html`）

**修复前**：
```javascript
if (narrative.audio_url) {
    multimediaHTML += `
        <a href="${narrative.audio_url}" target="_blank" class="...">
            🎵 收听语音版
        </a>
    `;
}
```

**问题**：
- `narrative.audio_url` = `/r2/narratives/audio/xxx.mp3`
- 在 admin 页面中解析为：`https://10break.com/admin/r2/...` ❌

**修复后**：
```javascript
if (narrative.audio_url) {
    // ✅ 修复：确保 URL 是完整的绝对路径
    const audioUrl = narrative.audio_url.startsWith('http') 
        ? narrative.audio_url 
        : `${ADMIN_CONFIG.API_BASE}${narrative.audio_url}`;
    multimediaHTML += `
        <a href="${audioUrl}" target="_blank" class="...">
            🎵 收听语音版
        </a>
    `;
}

if (narrative.video_url) {
    // ✅ 修复：确保 URL 是完整的绝对路径
    const videoUrl = narrative.video_url.startsWith('http') 
        ? narrative.video_url 
        : `${ADMIN_CONFIG.API_BASE}${narrative.video_url}`;
    multimediaHTML += `
        <a href="${videoUrl}" target="_blank" class="...">
            🎬 观看视频版
        </a>
    `;
}
```

**效果**：
- 相对路径：`/r2/narratives/audio/xxx.mp3`
- 转换为：`https://songbrocade-api.petterbrand03.workers.dev/r2/narratives/audio/xxx.mp3` ✅
- 点击链接正确播放文件

---

### 修复 2：添加匠人加载日志（`frontend/product.html`）

**修复前**：
```javascript
async function loadArtisanInfo(artisanId) {
  if (!artisanId) {
    // 显示"暂无匠人信息"
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/artisans`);
    const data = await response.json();
    
    if (data.artisans && data.artisans.length > 0) {
      const artisan = data.artisans.find(a => a.id === artisanId);
      if (artisan) {
        displayArtisanInfo(artisan);
      } else {
        // 显示"不可用"
        displayGenericArtisanInfo();
      }
    }
  } catch (error) {
    // 显示"不可用"
    displayGenericArtisanInfo();
  }
}
```

**问题**：无法诊断为什么显示"不可用"

**修复后**：
```javascript
async function loadArtisanInfo(artisanId) {
  console.log(`👤 Loading artisan info, artisan_id: ${artisanId}`);
  
  if (!artisanId) {
    console.warn('⚠️ No artisan_id provided');
    // 显示"暂无匠人信息"
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/artisans`);
    const data = await response.json();
    
    console.log(`👤 Fetched ${data.artisans?.length || 0} artisans from API`);
    
    if (data.artisans && data.artisans.length > 0) {
      const artisan = data.artisans.find(a => a.id === artisanId);
      if (artisan) {
        console.log(`✅ Found artisan: ${artisan.name_zh || artisan.name_en} (ID: ${artisan.id})`);
        displayArtisanInfo(artisan);
      } else {
        console.warn(`⚠️ Artisan not found with ID: ${artisanId}`);
        console.log(`Available artisan IDs: ${data.artisans.map(a => a.id).join(', ')}`);
        // 显示"不可用"
        displayGenericArtisanInfo();
      }
    }
  } catch (error) {
    console.error('❌ 加载匠人信息失败:', error);
    // 显示"不可用"
    displayGenericArtisanInfo();
  }
}
```

**效果**：
- 控制台显示详细的匠人加载日志
- 可以诊断问题：
  - 商品是否有 `artisan_id`
  - `artisan_id` 是否匹配数据库中的匠人
  - API 返回了哪些匠人 ID

---

## 🔍 诊断匠人显示问题

### 步骤 1：强制刷新页面
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

### 步骤 2：打开浏览器控制台
查看日志：

**情况 A：商品没有关联匠人**
```
👤 Loading artisan info, artisan_id: null
⚠️ No artisan_id provided
```
**解决方案**：在 `/admin/products.html` 编辑商品，设置 `artisan_id`

---

**情况 B：artisan_id 不匹配**
```
👤 Loading artisan info, artisan_id: art_999
👤 Fetched 5 artisans from API
⚠️ Artisan not found with ID: art_999
Available artisan IDs: art_001, art_002, art_003, art_004, art_005
```
**解决方案**：
1. 检查商品的 `artisan_id` 是否正确
2. 或在 `/admin/artisans.html` 创建 ID 为 `art_999` 的匠人

---

**情况 C：匠人加载成功**
```
👤 Loading artisan info, artisan_id: art_001
👤 Fetched 5 artisans from API
✅ Found artisan: 张大师 (ID: art_001)
```
**结果**：匠人信息正常显示，可以对话

---

## 📊 数据库检查

### 检查商品的 artisan_id
```sql
-- 检查特定商品的 artisan_id
SELECT id, name_zh, artisan_id
FROM products_new
WHERE id = 'id_19a28fd0a18_47a42e7525ca5';

-- 检查所有商品的 artisan_id
SELECT id, name_zh, artisan_id
FROM products_new
ORDER BY created_at DESC
LIMIT 20;
```

### 检查匠人列表
```sql
-- 检查所有匠人
SELECT id, name_zh, name_en, region
FROM artisans
ORDER BY created_at DESC;
```

### 修复 artisan_id 不匹配
```sql
-- 更新商品的 artisan_id
UPDATE products_new
SET artisan_id = 'art_001'
WHERE id = 'id_19a28fd0a18_47a42e7525ca5';
```

---

## 🚀 部署状态

- **前端版本**：https://f5914dd1.poap-checkin-frontend.pages.dev
- **后端版本**：296276ac-fd87-40c1-81e4-f63063f7f952
- **部署时间**：2025-11-02
- **修复内容**：
  1. ✅ 修复 admin 文件链接（音频/视频）
  2. ✅ 添加匠人加载详细日志
  3. ✅ 更新 CORS 白名单

---

## 🎯 验证步骤

### 验证 1：Admin 文件链接
1. 访问 `/admin/narrative-generator.html`
2. 选择一个已生成文化故事的商品
3. 点击"🎵 收听语音版"或"🎬 观看视频版"
4. **预期**：在新标签页中播放文件（不是跳转回主页）

---

### 验证 2：匠人显示
1. 访问商品详情页：`https://10break.com/product?id=id_19a28fd0a18_47a42e7525ca5`
2. 打开浏览器控制台（F12）
3. 查看日志：
   ```
   👤 Loading artisan info, artisan_id: ...
   ```
4. **根据日志诊断问题**：
   - 如果 `artisan_id: null` → 商品没有关联匠人
   - 如果 `Artisan not found` → artisan_id 不匹配
   - 如果 `✅ Found artisan` → 匠人加载成功

---

## 📋 快速修复清单

### 如果 Admin 文件链接仍然跳转回主页：
- [ ] 强制刷新页面（Cmd/Ctrl + Shift + R）
- [ ] 清除浏览器缓存
- [ ] 检查控制台是否有错误

### 如果匠人显示"不可用"：
- [ ] 查看控制台日志
- [ ] 检查商品的 `artisan_id`
- [ ] 检查数据库中的匠人列表
- [ ] 更新商品的 `artisan_id`（如果需要）

---

## 📚 相关文档

1. **最终修复总结**：`FINAL_FIX_SUMMARY.md`
2. **徽章 API 修复**：`BADGE_API_FIX.md`
3. **文化故事调试**：`CULTURAL_NARRATIVES_DEBUG.md`
4. **AI 数据隔离**：`AI_DATA_ISOLATION_FIX_COMPLETE.md`

---

**修复日期**：2025-11-02  
**修复人**：AI Assistant  
**状态**：✅ 已完成并部署

