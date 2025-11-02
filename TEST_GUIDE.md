# 🧪 测试指南 - 商品详情页修复

## ✅ 部署信息

- **前端 URL**: https://1a2d16de.poap-checkin-frontend.pages.dev
- **后端版本**: 00c5473f-8fb9-431b-a87b-ceca29249434
- **部署时间**: 2025-11-02 15:42 (北京时间)

---

## 📋 测试步骤

### 第 1 步：发布文化故事（必须！）

1. **访问 Admin 页面**
   ```
   https://1a2d16de.poap-checkin-frontend.pages.dev/admin/narrative-generator.html
   ```

2. **登录钱包**（如果未登录）

3. **找到已生成的文化故事**
   - 查看列表中的故事
   - 找到状态为 `draft`（草稿）的故事

4. **点击"✅ 发布"按钮**
   - 确认状态变为 `published`（已发布）
   - 记录发布的商品 ID

5. **测试音频/视频链接**
   - 点击"🎵 收听语音版"
   - 应该能直接播放音频，而不是跳转回主页
   - 如果有视频，点击"🎬 观看视频版"，应该能播放

---

### 第 2 步：测试商品详情页

1. **访问商品详情页**
   ```
   https://1a2d16de.poap-checkin-frontend.pages.dev/product?id=<商品ID>
   ```
   将 `<商品ID>` 替换为第 1 步中发布故事的商品 ID

2. **强制刷新页面**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`
   - 这会清除浏览器缓存

3. **打开浏览器控制台**
   - Mac: `Cmd + Option + I`
   - Windows: `F12`

4. **点击"了解文化故事"按钮**

5. **检查控制台日志**
   应该看到类似：
   ```
   📖 Loading cultural narratives for product: id_19a28fd0a18_47a42e7525ca5
   📖 API URL: .../ai/narrative/product/id_19a28fd0a18_47a42e7525ca5?status=published
   📖 Response status: 200
   📖 Response data: { ok: true, narratives: Array(1), total: 1 }
   ✅ Found 1 narratives
   ```

6. **查看文化故事卡片**
   - 应该能看到故事内容
   - 有三个标签：📖 文字、🎵 语音、🎬 视频（如果有）

7. **测试音频播放**
   - 点击"🎵 语音"标签
   - 点击播放按钮
   - 应该能正常播放音频

8. **测试视频播放**（如果有）
   - 点击"🎬 视频"标签
   - 点击播放按钮
   - 应该能正常播放视频

---

### 第 3 步：检查匠人信息

1. **在同一个商品详情页**

2. **向下滚动到"匠人信息"区域**

3. **检查控制台日志**
   - ✅ 成功情况：
     ```
     👤 Loading artisan info, artisan_id: artisan_001
     👤 Fetched 14 artisans from API
     ✅ Found artisan: 李明 (ID: artisan_001)
     ```
   
   - ⚠️ 失败情况（匠人 ID 不匹配）：
     ```
     👤 Loading artisan info, artisan_id: id_19a4336d63b_c74496ea472f2
     👤 Fetched 14 artisans from API
     ⚠️ Artisan not found with ID: id_19a4336d63b_c74496ea472f2
     Available artisan IDs: artisan_001, artisan_003, artisan_004, ...
     ```

4. **如果匠人 ID 不匹配**
   - 记录控制台中显示的"Available artisan IDs"
   - 前往 Admin 商品管理页面修复（见第 4 步）

5. **测试"与匠人对话"功能**
   - 点击匠人卡片底部的"💬 与匠人对话"按钮
   - 应该弹出聊天对话框
   - 输入问题并发送
   - 应该能收到 AI 回复

---

### 第 4 步：修复匠人 ID（如果需要）

1. **访问 Admin 商品管理页面**
   ```
   https://1a2d16de.poap-checkin-frontend.pages.dev/admin/products.html
   ```

2. **找到需要修复的商品**
   - 点击"编辑"按钮

3. **修改"匠人 ID"字段**
   - 查看第 3 步控制台中的"Available artisan IDs"
   - 选择一个正确的匠人 ID（如 `artisan_001`）
   - 替换原来的错误 ID

4. **保存商品**

5. **返回商品详情页测试**
   - 强制刷新页面
   - 应该能看到正确的匠人信息
   - "与匠人对话"功能应该可用

---

## 🎯 预期结果

### ✅ 成功标志

1. **文化故事**
   - ✅ 能看到已发布的文化故事
   - ✅ 文字、音频、视频都能正常显示和播放
   - ✅ 控制台显示 `✅ Found X narratives`

2. **匠人信息**
   - ✅ 能看到匠人的名字、头像、简介
   - ✅ "与匠人对话"按钮可用
   - ✅ 能正常与 AI 对话
   - ✅ 控制台显示 `✅ Found artisan: xxx (ID: xxx)`

3. **Admin 链接**
   - ✅ 在 narrative-generator 页面点击音频/视频链接能正常播放
   - ✅ 不会跳转回主页

### ❌ 失败标志

1. **文化故事不显示**
   - ❌ 显示"暂无文化故事内容"
   - ❌ 控制台显示 `narratives: Array(0)`
   - **原因**：故事未发布（status 为 draft）
   - **解决**：在 admin 页面点击"发布"按钮

2. **匠人对话不可用**
   - ❌ 显示"暂无匠人信息"或通用匠人信息
   - ❌ 控制台显示 `⚠️ Artisan not found with ID: xxx`
   - **原因**：商品的 artisan_id 格式不正确
   - **解决**：在 admin 商品管理页面修改为正确的匠人 ID

3. **音频/视频无法播放**
   - ❌ 点击播放没有反应
   - ❌ 控制台显示 404/500 错误
   - **原因**：R2 路由问题或文件不存在
   - **解决**：检查后端日志，确认文件已上传到 R2

---

## 🔧 故障排除

### 问题 1：文化故事依然不显示

**检查清单**：
1. ✅ 是否在 admin 页面点击了"发布"？
2. ✅ 是否强制刷新了页面（Cmd/Ctrl + Shift + R）？
3. ✅ 控制台是否显示 `status=published`？
4. ✅ 控制台是否显示 `narratives: Array(0)`？

**解决方案**：
- 如果 `narratives: Array(0)`，说明数据库中没有该商品的已发布故事
- 前往 admin 页面，为该商品生成并发布文化故事

### 问题 2：音频无法播放

**检查清单**：
1. ✅ 控制台是否有 404/500 错误？
2. ✅ 音频 URL 格式是否正确？
   - 应该是：`https://songbrocade-api.petterbrand03.workers.dev/r2/narratives/audio/nrt_xxx.mp3`
3. ✅ 直接访问音频 URL 是否能下载？

**解决方案**：
- 如果 404：文件不存在，需要重新生成音频
- 如果 500：后端错误，检查 Worker 日志
- 如果 CORS 错误：已修复，清除浏览器缓存

### 问题 3：匠人对话返回 410 错误

**检查清单**：
1. ✅ 控制台是否显示 `POST .../ai/artisan-chat 410 (Gone)`？
2. ✅ 是否强制刷新了页面？

**解决方案**：
- 这是浏览器缓存问题
- 强制刷新页面（Cmd/Ctrl + Shift + R）
- 应该看到 `🎭 ArtisanChatInline v2.0 loaded`

---

## 📊 测试报告模板

**请按以下格式提供测试结果**：

```
【测试环境】
- 浏览器：Chrome / Safari / Firefox
- 设备：Mac / Windows / iPhone / Android
- 前端 URL：https://1a2d16de.poap-checkin-frontend.pages.dev

【测试结果】
✅ / ❌ 文化故事显示
✅ / ❌ 音频播放
✅ / ❌ 视频播放
✅ / ❌ 匠人信息显示
✅ / ❌ 与匠人对话

【控制台日志】
（复制关键日志，特别是错误信息）

【截图】
（如果有问题，请提供截图）

【其他问题】
（描述任何其他发现的问题）
```

---

## 🎉 测试完成后

如果所有测试通过：
1. ✅ 确认修复成功
2. ✅ 可以继续使用该部署
3. ✅ 如果需要，可以将该部署绑定到自定义域名

如果有问题：
1. ❌ 提供详细的测试报告（使用上面的模板）
2. ❌ 包含控制台日志和截图
3. ❌ 我会进一步修复

---

**现在请开始测试，并告诉我结果！** 🧪✨

