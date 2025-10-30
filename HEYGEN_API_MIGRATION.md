# HeyGen API 迁移说明

**更新日期**: 2025-10-30  
**变更**: 视频生成从 Stable Video Diffusion (Replicate) 迁移到 HeyGen API

---

## 📋 变更概览

### 之前（Replicate API）
- **模型**: Stable Video Diffusion
- **类型**: 图像/文本到视频
- **输出**: 3-5秒产品展示短视频
- **成本**: ~¥0.22/视频
- **生成时间**: 2-5 分钟

### 现在（HeyGen API）
- **模型**: HeyGen AI 数字人
- **类型**: 数字人朗读视频
- **输出**: 30-90秒数字人讲解视频
- **成本**: ~¥5/视频（Business 套餐）
- **生成时间**: 3-10 分钟

---

## 🔧 需要的配置更改

### 1. 环境变量更新

#### Cloudflare Worker 环境变量

**删除**（可选，保留也不影响）:
```
REPLICATE_API_KEY
```

**添加**（必须）:
```
变量名: HEYGEN_API_KEY
值: 你的 HeyGen API Key
类型: Secret (加密)
```

#### 配置步骤

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的 Worker 项目（`worker-api`）
4. Settings → Variables
5. 点击 "Add variable"
6. 添加 `HEYGEN_API_KEY`，选择 "Encrypt"
7. 点击 "Save and deploy"

---

### 2. 本地开发环境

编辑 `.dev.vars` 文件（如果本地测试）:

```bash
# .dev.vars
HEYGEN_API_KEY=你的HeyGen_API_Key
OPENAI_API_KEY=你的OpenAI_API_Key
ANTHROPIC_API_KEY=你的Anthropic_API_Key
```

---

## 📝 代码变更清单

### 已修改的文件

1. ✅ **worker-api/utils/video-helper.js**
   - 更新 `generateVideo()` 函数，使用 HeyGen API
   - 更新 `checkVideoStatus()` 函数，适配 HeyGen 状态检查
   - 更新 `downloadAndUploadVideo()` 函数，支持时长参数
   - 更新 `getRecommendedVideoStyle()` 函数，返回数字人配置
   - 新增 `getAvailableAvatars()` 和 `getAvailableVoices()` 辅助函数

2. ✅ **worker-api/utils/multimedia-generator.js**
   - 更新视频生成逻辑，使用 `HEYGEN_API_KEY`
   - 更新成本估算，反映 HeyGen 定价
   - 适配 HeyGen 的配置参数

3. ✅ **frontend/admin/narrative-generator.html**
   - 更新视频选项说明，从"AI 视频"改为"数字人讲解"
   - 更新视频风格选择，使用数字人形象
   - 更新成本提示信息
   - 添加 HeyGen 相关提示

4. ✅ **HEYGEN_VIDEO_SETUP.md** (新文件)
   - HeyGen API 完整配置指南
   - 成本分析和使用说明

5. ✅ **HEYGEN_API_MIGRATION.md** (本文件)
   - 迁移说明和检查清单

---

## 🔄 数据库结构

**无需修改** - 数据库表结构保持不变，仍使用相同的字段：

```sql
-- content_variants 表
audio_key TEXT,
audio_url TEXT,
audio_duration INTEGER,
audio_size INTEGER,
video_key TEXT,
video_url TEXT,
video_duration INTEGER,
video_size INTEGER,
video_thumbnail TEXT,
generation_status TEXT,
generation_progress TEXT
```

HeyGen 视频数据存储方式与之前相同，无需迁移数据。

---

## ✅ 部署检查清单

### 部署前检查

- [x] 已修改所有相关代码文件
- [x] 已更新前端界面说明
- [x] 已创建配置文档
- [ ] 已获取 HeyGen API Key
- [ ] 已配置 Cloudflare Worker 环境变量
- [ ] 已测试本地开发环境（可选）

### 部署步骤

1. **配置 HeyGen API Key**
   ```bash
   # 在 Cloudflare Dashboard 中添加环境变量
   HEYGEN_API_KEY=你的API_Key
   ```

2. **提交代码到 Git**
   ```bash
   git add .
   git commit -m "迁移视频生成到 HeyGen API"
   git push origin main
   ```

3. **部署 Worker API**
   ```bash
   cd worker-api
   npm run deploy
   ```

4. **部署前端**
   ```bash
   cd frontend
   # Cloudflare Pages 会自动部署
   ```

5. **测试验证**
   - 访问管理后台
   - 进入文化叙事生成工具
   - 选择商品并勾选"生成视频版"
   - 选择数字人形象（如 Anna）
   - 点击生成，观察是否成功调用 HeyGen API

### 部署后验证

- [ ] 环境变量配置正确
- [ ] Worker API 部署成功
- [ ] 前端界面更新正确
- [ ] 视频生成功能正常工作
- [ ] 视频状态检查正常
- [ ] 视频下载和存储正常
- [ ] 前端可正常播放视频

---

## 🧪 测试指南

### 测试模式

HeyGen 提供测试模式（带水印），可用于开发测试：

```javascript
// 在 video-helper.js 中临时修改
export async function generateVideo(prompt, options = {}) {
  // ...
  body: JSON.stringify({
    test: true,  // 改为 true 启用测试模式
    // ...
  })
}
```

**注意**: 测试模式生成的视频带 HeyGen 水印，仅用于开发测试，正式发布前改回 `false`

### 测试步骤

1. **单个视频测试**
   - 选择一个商品
   - 只选择一种叙事类型（如"故事版"）
   - 勾选"生成视频版"
   - 点击生成
   - 等待 3-10 分钟
   - 检查视频是否生成成功

2. **多视频测试**
   - 选择多种叙事类型
   - 检查所有视频是否都能正常生成

3. **成本监控**
   - 登录 HeyGen Dashboard
   - 检查视频生成消耗的时长
   - 确认与预期一致

---

## 🚨 常见问题

### Q1: HeyGen API 返回错误

**可能原因**:
- API Key 未配置或错误
- API Key 配额用尽
- 请求格式错误

**解决方案**:
```javascript
// 检查环境变量
console.log('HeyGen API Key:', env.HEYGEN_API_KEY ? '已配置' : '未配置');

// 检查错误详情
catch (error) {
  console.error('HeyGen error details:', error);
}
```

### Q2: 视频生成时间过长

**说明**: HeyGen 视频生成通常需要 3-10 分钟，这是正常的。

**建议**:
- 使用异步处理（已实现）
- 在前端显示"生成中"提示（已实现）
- 提供刷新按钮，让用户稍后查看

### Q3: 成本超出预期

**原因**: HeyGen 视频成本较高（~¥5/视频）

**解决方案**:
1. 只为重点商品生成视频
2. 只选择 1-2 种核心叙事类型
3. 使用测试模式验证效果后再正式生成
4. 监控 HeyGen Dashboard 的配额使用情况

### Q4: 视频质量不满意

**优化方向**:
1. 调整文本内容，使其更适合朗读
2. 尝试不同的数字人形象
3. 调整语音风格
4. 修改背景颜色

---

## 🔙 回滚方案

如果需要回滚到之前的 Replicate API：

1. **恢复代码**
   ```bash
   git revert HEAD
   ```

2. **重新配置环境变量**
   ```
   REPLICATE_API_KEY=你的Replicate_API_Key
   ```

3. **重新部署**
   ```bash
   npm run deploy
   ```

**注意**: 保留本次修改的代码作为备份，以便将来可能再次切换。

---

## 📊 成本对比

### 单个商品（4种叙事类型）

| 配置 | Replicate (旧) | HeyGen (新) | 差异 |
|------|---------------|-------------|------|
| 仅文字 | ¥1.72 | ¥1.72 | 无变化 |
| 文字+语音 | ¥1.96 | ¥1.96 | 无变化 |
| 文字+语音+视频 | ¥2.84 | ¥21.96 | +¥19.12 |

### 100个商品（全格式）

| 方案 | Replicate (旧) | HeyGen (新) | 差异 |
|------|---------------|-------------|------|
| 全格式 | ¥284 | ¥2,196 | +¥1,912 |

### 成本分析

**优势**:
- ✅ 视频质量更高，数字人讲解更专业
- ✅ 视频时长更长（30-90秒 vs 3-5秒）
- ✅ 更适合文化产品的展示和讲解

**劣势**:
- ❌ 成本显著增加（约 7.7 倍）
- ❌ 生成时间稍长（3-10分钟 vs 2-5分钟）

**建议**:
- 选择性使用，为重点商品生成视频
- 或只选择核心叙事类型（如"故事版"）

---

## 📞 技术支持

- **HeyGen 官方支持**: https://www.heygen.com/support
- **API 文档**: https://docs.heygen.com/
- **项目配置指南**: 参见 `HEYGEN_VIDEO_SETUP.md`

---

## ✨ 未来优化方向

1. **成本优化**: 探索更经济的数字人视频方案
2. **批量生成**: 优化批量视频生成流程
3. **视频编辑**: 添加简单的视频后期处理
4. **多语言支持**: 支持英文等其他语言的数字人
5. **自定义数字人**: 使用自定义的数字人形象

---

**迁移完成日期**: 2025-10-30  
**版本**: 1.0

