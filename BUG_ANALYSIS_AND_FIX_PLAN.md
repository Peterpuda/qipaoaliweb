# 🐛 商品详情页问题分析与修复计划

**分析时间**: 2025-10-28  
**页面**: product.html

---

## 🔍 问题定位

### 问题 1: 文化叙事内容找不到 ❌

**现象**: 管理员已在后台发布文化叙事，但前端点击"了解文化故事"按钮后提示无内容

**原因分析**:
1. ✅ API 调用代码正确：`${API_BASE}/ai/narrative/product/${productId}?status=published`
2. ❌ **用户访问的是旧域名**: `songbrocade-frontend.pages.dev`
3. ❌ **应该访问的新域名**: `branch-prod.poap-checkin-frontend.pages.dev`
4. 旧域名可能没有最新的代码部署

**定位**:
- 文件：`frontend/product.html` 第 919-933 行
- API 端点：`/ai/narrative/product/{productId}?status=published`

---

### 问题 2: 语音链接跳转回首页 ❌

**现象**: 点击"收听语音版"链接后，打开新标签页但跳转回首页

**原因分析**:
1. 音频链接代码：
```javascript
<a href="${narrative.audio_url}" target="_blank" ...>
  🎵 收听语音版
</a>
```

2. **可能的原因**:
   - `audio_url` 为空或 null
   - `audio_url` 是相对路径，导致跳转到 `/` 或 `/undefined`
   - R2 存储的文件没有正确的 URL

**定位**:
- 文件：`frontend/product.html` 第 992-998 行
- 数据来源：后端 API `/ai/narrative/product/${productId}`
- 预期格式：完整的 R2 URL 或代理路径

---

### 问题 3: 匠人对话 AI 网络错误 ❌

**现象**: 点击"与匠人对话"按钮后提示网络错误，但管理员测试时成功

**错误信息**（从截图）:
```
POST https://songbrocade-frontend.pages.dev/undefined/ai/artisan-agent/reply 
405 (Method Not Allowed)

Uncaught TypeError: ArtisanChat.init is not a function
```

**原因分析**:

#### 问题 3.1: API_BASE 配置错误 ⚠️

在 `artisan-chat.js` 第 5-7 行：
```javascript
const API_BASE = typeof POAP_CONFIG !== 'undefined' 
  ? POAP_CONFIG.API_BASE 
  : 'https://songbrocade-api.petterbrand03.workers.dev';
```

**错误**: `POAP_CONFIG.API_BASE` **不存在**！

在 `poap.config.js` 中实际是：
```javascript
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://songbrocade-api.petterbrand03.workers.dev",  // ✓
  // 没有 API_BASE 属性！ ✗
}
```

**结果**: 
- `API_BASE` 变成 `undefined`
- API 调用变成：`${undefined}/ai/artisan-agent/reply`
- 浏览器解析为：`songbrocade-frontend.pages.dev/undefined/ai/...`

#### 问题 3.2: ArtisanChat.init 未导出 ⚠️

从错误信息看：`Uncaught TypeError: ArtisanChat.init is not a function`

检查 `artisan-chat.js`，可能没有正确导出 `init` 方法。

**定位**:
- 文件：`frontend/common/artisan-chat.js` 第 5-7 行
- 问题：读取错误的配置属性名

---

## 🔧 修复计划

### 修复 1: 统一 API_BASE 配置 ✅ 高优先级

**方案**: 统一使用 `WORKER_BASE_URL`

#### 步骤 1.1: 修复 poap.config.js
添加 `API_BASE` 属性以保持向后兼容：

```javascript
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://songbrocade-api.petterbrand03.workers.dev",
  API_BASE: "https://songbrocade-api.petterbrand03.workers.dev",  // 新增
  // ...
}
```

#### 步骤 1.2: 修复 artisan-chat.js
修改 API_BASE 读取逻辑：

```javascript
const API_BASE = typeof POAP_CONFIG !== 'undefined' 
  ? (POAP_CONFIG.API_BASE || POAP_CONFIG.WORKER_BASE_URL)  // 修复
  : 'https://songbrocade-api.petterbrand03.workers.dev';
```

#### 步骤 1.3: 修复 product.html
确保 `product.html` 正确引入 `poap.config.js` 并使用全局 `API_BASE`。

---

### 修复 2: 修复语音链接问题 ✅ 高优先级

**方案**: 检查并修复 audio_url 的生成和使用

#### 步骤 2.1: 检查后端 API 返回
验证 `/ai/narrative/product/{productId}` API 返回的 `audio_url` 是否正确。

#### 步骤 2.2: 修复前端音频链接
如果 `audio_url` 为空，不显示"收听语音版"按钮：

```javascript
if (narrative.audio_url) {
  mediaTabsHTML += `
    <button onclick="switchMediaTab('${narrative.id}', 'audio', event)">
      🎵 语音
    </button>
  `;
  mediaContentHTML += `
    <div id="media-${narrative.id}-audio">
      <audio controls class="w-full mb-4">
        <source src="${narrative.audio_url}" type="audio/mpeg">
      </audio>
    </div>
  `;
}
```

**注意**: 不要使用 `<a href target="_blank">`，改用内嵌的 `<audio>` 标签。

---

### 修复 3: 确保使用正确的部署地址 ✅ 高优先级

**方案**: 引导用户访问正确的域名

#### 当前部署地址：
- ❌ 旧地址：`songbrocade-frontend.pages.dev`
- ✅ **新地址**: `branch-prod.poap-checkin-frontend.pages.dev`

#### 解决方案：
1. 在旧域名添加重定向（如果可能）
2. 或者提醒用户使用新域名

---

### 修复 4: 检查 ArtisanChat 初始化 ✅ 中优先级

**方案**: 确保 ArtisanChat 正确导出和初始化

#### 步骤 4.1: 检查 artisan-chat.js 导出
确保在文件末尾正确导出：

```javascript
return {
  init: initModal,      // ✓ 确保导出
  open: openChat,
  close: closeChat,
  send: sendMessage
};
```

#### 步骤 4.2: 检查 product.html 初始化
确保在 DOMContentLoaded 中正确初始化：

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // 初始化 AI 对话组件
  if (typeof ArtisanChat !== 'undefined') {
    ArtisanChat.init();  // ✓ 调用 init
  }
});
```

---

## 🎯 修复优先级

| 问题 | 优先级 | 影响 | 修复时间 |
|-----|-------|------|---------|
| API_BASE 配置错误 | 🔴 P0 | 匠人对话完全无法使用 | 5 分钟 |
| 语音链接问题 | 🔴 P0 | 语音功能无法使用 | 10 分钟 |
| 使用旧域名 | 🟡 P1 | 功能可能不是最新 | 需要用户配合 |
| ArtisanChat 初始化 | 🟡 P1 | 可能导致功能异常 | 5 分钟 |

**总修复时间**: 约 20-30 分钟

---

## 📋 修复检查清单

### 代码修复
- [ ] 修复 `poap.config.js`（添加 API_BASE）
- [ ] 修复 `artisan-chat.js`（API_BASE 读取逻辑）
- [ ] 修复 `product.html`（音频链接显示逻辑）
- [ ] 检查 ArtisanChat 导出和初始化

### 测试验证
- [ ] 测试文化叙事加载（使用新域名）
- [ ] 测试语音播放（内嵌播放器）
- [ ] 测试匠人对话（API 调用）
- [ ] 测试视频播放

### 部署
- [ ] 重新部署前端到 `branch-prod`
- [ ] 重新部署后端（如有修改）
- [ ] 验证 CORS 配置

---

## 🔍 根本原因总结

1. **配置不一致**: `poap.config.js` 使用 `WORKER_BASE_URL`，但多个文件期望 `API_BASE`
2. **域名混乱**: 用户访问旧域名，新功能未部署到旧域名
3. **错误处理不足**: 当 `audio_url` 为空时，仍显示链接导致跳转错误

---

## 💡 建议

### 短期建议
1. 立即修复 API_BASE 配置问题
2. 统一使用 `branch-prod.poap-checkin-frontend.pages.dev`
3. 添加错误提示（当音频/视频未生成时）

### 长期建议
1. **统一配置管理**: 所有配置统一到 `poap.config.js`
2. **环境变量管理**: 使用环境变量区分开发/生产环境
3. **域名管理**: 使用自定义域名，避免 Cloudflare Pages 随机域名混乱
4. **错误处理**: 添加更友好的错误提示和降级方案

---

**准备开始修复？请确认后我立即开始编码！**

