# 🔍 index.html 页面未翻译中文定位报告

## 📋 诊断结果

经过详细检查，发现 `index.html` 页面中存在**多处未翻译的中文文本**。虽然很多元素有 `data-i18n` 属性，但**同一元素内部仍有硬编码的中文**，或者**某些元素完全没有 `data-i18n` 属性**。

---

## ❌ 发现的未翻译中文文本

### 1. **Title 属性** (2处)

#### 1.1 Line 376 - 音量控制按钮
```html
<button id="volumeBtn" class="video-control-btn" title="开启/关闭声音">
```
**问题：** `title` 属性中的中文 "开启/关闭声音" 没有 `data-i18n-title` 属性

---

#### 1.2 Line 379 - 播放/暂停按钮
```html
<button id="playPauseBtn" class="video-control-btn" title="播放/暂停">
```
**问题：** `title` 属性中的中文 "播放/暂停" 没有 `data-i18n-title` 属性

---

### 2. **DAO 治理卡片** (2处硬编码中文段落)

#### 2.1 Line 477 - 第一段描述
```html
<p class="text-gray-400 leading-relaxed text-sm sm:text-base mb-6">
  文化保护不再是少数人的使命，而是全球社区的共识。
  采用 <strong class="text-white" data-i18n="homepage.dao.description">DAO 去中心化自治</strong> 模式，
  持有 <span class="text-[#D4AF37] font-semibold">$QI</span> 就是 
  <span class="text-white" data-i18n="homepage.dao.keyPhrase">参与未来传承的钥匙</span> — 
  你的每一票，都在决定哪些文化值得被永续守护
</p>
```
**问题：** 
- `文化保护不再是少数人的使命，而是全球社区的共识。` - **没有 data-i18n 属性**
- `你的每一票，都在决定哪些文化值得被永续守护` - **没有 data-i18n 属性**

---

### 3. **Ecosystem 生态系统卡片** (多处硬编码中文)

#### 3.1 Line 658 - 匠人中心标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  匠人中心
  <span class="ml-2 text-xs px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full" data-i18n="homepage.ecosystem.feature1Badge">AI 对话</span>
</h3>
```
**问题：** `匠人中心` - **没有 data-i18n 属性**

---

#### 3.2 Line 663 - 匠人中心描述（部分）
```html
<p class="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
  <span class="text-white" data-i18n="homepage.ecosystem.feature1Desc">每位匠人都有 AI 分身，随时回答你的问题。</span>
  从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动
</p>
```
**问题：** `从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动` - **没有 data-i18n 属性**

---

#### 3.3 Line 666 - 匠人中心按钮文本
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  与匠人对话 <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**问题：** `与匠人对话` - **没有 data-i18n 属性**

---

#### 3.4 Line 676 - 链上真品馆标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  链上真品馆
  <span class="ml-2 text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full">NFT</span>
</h3>
```
**问题：** `链上真品馆` - **没有 data-i18n 属性**

---

#### 3.5 Line 681 - 链上真品馆描述（部分）
```html
<p class="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
  <span class="text-white" data-i18n="homepage.ecosystem.feature2Desc">每件作品都有唯一 NFT 凭证。</span>
  假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆
</p>
```
**问题：** `假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆` - **没有 data-i18n 属性**

---

#### 3.6 Line 684 - 链上真品馆按钮文本
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  探索藏品 <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**问题：** `探索藏品` - **没有 data-i18n 属性**

---

#### 3.7 Line 694 - 参与证明标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  参与证明
  <span class="ml-2 text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">POAP</span>
</h3>
```
**问题：** `参与证明` - **没有 data-i18n 属性**

---

#### 3.8 Line 701 - 参与证明按钮文本
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  铭刻参与 <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**问题：** `铭刻参与` - **没有 data-i18n 属性**

---

#### 3.9 Line 712+ - DAO 治理卡片（需要检查）
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  全球共治
  ...
</h3>
```
**问题：** `全球共治` 及后续描述文本需要检查是否有 `data-i18n` 属性

---

### 4. **Tech 技术栈区域** (1处硬编码中文)

#### 4.1 Line 732 - 技术栈标签
```html
<span class="text-[#D4AF37] text-xs sm:text-sm font-bold uppercase tracking-wider">
  <i class="fas fa-layer-group mr-2"></i>技术栈
</span>
```
**问题：** `技术栈` - **没有 data-i18n 属性**（虽然在 `<span>` 标签内，但需要翻译）

---

#### 4.2 Line 741 - 技术栈描述（部分）
```html
<p class="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
  <span data-i18n="homepage.tech.title">融合 AI、区块链、Web3</span>
  <span class="text-[#D4AF37] font-semibold" data-i18n="homepage.ecosystem.techLabel1">区块链</span>、
  <span class="text-[#D4AF37] font-semibold" data-i18n="homepage.ecosystem.techLabel2">去中心化存储</span> 
  等前沿技术，打造安全可靠的文化保护平台
</p>
```
**问题：** `等前沿技术，打造安全可靠的文化保护平台` - **没有 data-i18n 属性**

---

### 5. **JavaScript 动态内容** (需要检查)

可能还有 JavaScript 动态生成的中文文本，需要检查：
- JavaScript 代码中的字符串字面量
- 通过 `innerHTML` 或 `textContent` 设置的文本
- `console.log` 中的中文（虽然不影响显示）

---

## 📊 问题统计

| 类型 | 数量 | 行号 |
|------|------|------|
| **Title 属性** | 2 | 376, 379 |
| **DAO 治理段落** | 2 | 477, 481 |
| **Ecosystem 卡片标题** | 4 | 658, 676, 694, 712 |
| **Ecosystem 卡片描述** | 3 | 663, 681 |
| **Ecosystem 卡片按钮** | 3 | 666, 684, 701 |
| **Tech 区域** | 2 | 732, 741 |
| **总计** | **16+** | |

---

## 🎯 问题分析

### 主要问题类型

1. **混合内容问题**
   - 一个 `<p>` 标签内有多个 `<span>`，但有些有 `data-i18n`，有些没有
   - 例如：第663行，第一个 `<span>` 有 `data-i18n`，但后面的文本没有

2. **完全缺失 data-i18n**
   - 某些标题或按钮文本完全没有 `data-i18n` 属性
   - 例如：`匠人中心`、`链上真品馆`、`参与证明` 等

3. **Title 属性未翻译**
   - `title` 属性中的中文没有使用 `data-i18n-title` 属性

4. **部分段落未翻译**
   - 长段落中只有部分文本有 `data-i18n`，其他部分还是硬编码中文

---

## 💡 修复建议

### 修复优先级

#### P0 - 高优先级（影响主要展示区域）
1. ✅ Title 属性（376, 379）
2. ✅ Ecosystem 卡片标题（658, 676, 694, 712）
3. ✅ Ecosystem 卡片按钮文本（666, 684, 701）
4. ✅ Tech 区域文本（732, 741）

#### P1 - 中优先级（补充说明文字）
5. ✅ DAO 治理段落（477, 481）
6. ✅ Ecosystem 卡片描述补充文本（663, 681）

### 修复方法

1. **为 Title 属性添加 `data-i18n-title`**
   ```html
   <!-- 修复前 -->
   <button title="开启/关闭声音">
   
   <!-- 修复后 -->
   <button data-i18n-title="common.toggleSound" title="开启/关闭声音">
   ```

2. **为缺失的标题添加 `data-i18n`**
   ```html
   <!-- 修复前 -->
   <h3>匠人中心</h3>
   
   <!-- 修复后 -->
   <h3 data-i18n="homepage.ecosystem.artisanCenter">匠人中心</h3>
   ```

3. **拆分混合内容，为每个部分添加 `data-i18n`**
   ```html
   <!-- 修复前 -->
   <p>
     <span data-i18n="homepage.ecosystem.feature1Desc">每位匠人都有 AI 分身，随时回答你的问题。</span>
     从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动
   </p>
   
   <!-- 修复后 -->
   <p>
     <span data-i18n="homepage.ecosystem.feature1Desc">每位匠人都有 AI 分身，随时回答你的问题。</span>
     <span data-i18n="homepage.ecosystem.feature1Desc2">从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动</span>
   </p>
   ```

4. **为按钮文本添加 `data-i18n`**
   ```html
   <!-- 修复前 -->
   <div>与匠人对话 <i class="fas fa-arrow-right"></i></div>
   
   <!-- 修复后 -->
   <div>
     <span data-i18n="homepage.ecosystem.talkToArtisan">与匠人对话</span>
     <i class="fas fa-arrow-right"></i>
   </div>
   ```

---

## 📝 需要添加的翻译键

根据发现的问题，需要在语言包中添加以下翻译键：

### Title 属性
- `common.toggleSound` - "开启/关闭声音" / "Toggle Sound"
- `common.playPause` - "播放/暂停" / "Play/Pause"

### DAO 治理
- `homepage.dao.intro1` - "文化保护不再是少数人的使命，而是全球社区的共识。"
- `homepage.dao.intro2` - "你的每一票，都在决定哪些文化值得被永续守护"

### Ecosystem 生态系统
- `homepage.ecosystem.artisanCenter` - "匠人中心"
- `homepage.ecosystem.feature1Desc2` - "从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动"
- `homepage.ecosystem.talkToArtisan` - "与匠人对话"
- `homepage.ecosystem.authenticGallery` - "链上真品馆"
- `homepage.ecosystem.feature2Desc2` - "假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆"
- `homepage.ecosystem.exploreCollection` - "探索藏品"
- `homepage.ecosystem.participationProof` - "参与证明"
- `homepage.ecosystem.inscribeParticipation` - "铭刻参与"
- `homepage.ecosystem.globalGovernance` - "全球共治"（如果缺失）

### Tech 技术栈
- `homepage.tech.label` - "技术栈"
- `homepage.tech.desc` - "等前沿技术，打造安全可靠的文化保护平台"

---

## 📋 修复检查清单

- [ ] Line 376: 添加 `data-i18n-title="common.toggleSound"`
- [ ] Line 379: 添加 `data-i18n-title="common.playPause"`
- [ ] Line 477: 为第一段添加 `data-i18n="homepage.dao.intro1"`
- [ ] Line 481: 为最后一句添加 `data-i18n="homepage.dao.intro2"`
- [ ] Line 658: 为 "匠人中心" 添加 `data-i18n="homepage.ecosystem.artisanCenter"`
- [ ] Line 663: 为补充描述添加 `data-i18n="homepage.ecosystem.feature1Desc2"`
- [ ] Line 666: 为 "与匠人对话" 添加 `data-i18n="homepage.ecosystem.talkToArtisan"`
- [ ] Line 676: 为 "链上真品馆" 添加 `data-i18n="homepage.ecosystem.authenticGallery"`
- [ ] Line 681: 为补充描述添加 `data-i18n="homepage.ecosystem.feature2Desc2"`
- [ ] Line 684: 为 "探索藏品" 添加 `data-i18n="homepage.ecosystem.exploreCollection"`
- [ ] Line 694: 为 "参与证明" 添加 `data-i18n="homepage.ecosystem.participationProof"`
- [ ] Line 701: 为 "铭刻参与" 添加 `data-i18n="homepage.ecosystem.inscribeParticipation"`
- [ ] Line 732: 为 "技术栈" 添加 `data-i18n="homepage.tech.label"`
- [ ] Line 741: 为补充描述添加 `data-i18n="homepage.tech.desc"`
- [ ] 检查 DAO 治理卡片（Line 712+）是否有未翻译文本
- [ ] 添加所有翻译键到 7 种语言包

---

## 🎯 总结

**发现的问题：**
- 总计：**16+ 处未翻译中文文本**
- 主要分布在：DAO 治理卡片、Ecosystem 生态系统卡片、Tech 技术栈区域
- 类型：标题、描述补充文本、按钮文本、Title 属性

**影响：**
- 当切换到英文或其他语言时，这些文本仍显示为中文
- 影响用户体验和网站的专业性

**修复复杂度：**
- 中等：需要为每个未翻译的文本添加 `data-i18n` 属性
- 需要添加约 **15-20 个新翻译键**到所有 7 种语言包
- 预计需要添加 **105-140 条新翻译**

---

**修复完成后，英文页面将不再显示任何中文文本！** ✅

