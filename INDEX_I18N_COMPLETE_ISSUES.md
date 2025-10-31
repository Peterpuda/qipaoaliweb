# 🔍 index.html 主页未翻译中文完整定位报告

## 📊 诊断总结

经过详细检查，在 `index.html` 页面中发现 **20+ 处未翻译的中文文本**。

**主要分布区域：**
1. Title 属性（2处）
2. DAO 治理卡片（2处段落）
3. Ecosystem 生态系统卡片（10+处）
4. Tech 技术栈区域（2处）
5. 导航按钮（2处需要验证翻译键）

---

## ❌ 发现的未翻译中文文本清单

### 1. **Title 属性** (2处)

#### ❌ Line 376 - 音量控制按钮
```html
<button id="volumeBtn" class="video-control-btn" title="开启/关闭声音">
```
**状态：** ❌ 未翻译  
**问题：** `title` 属性中有中文，但没有 `data-i18n-title` 属性  
**修复：** 添加 `data-i18n-title="common.toggleSound"`

---

#### ❌ Line 379 - 播放/暂停按钮
```html
<button id="playPauseBtn" class="video-control-btn" title="播放/暂停">
```
**状态：** ❌ 未翻译  
**问题：** `title` 属性中有中文，但没有 `data-i18n-title` 属性  
**修复：** 添加 `data-i18n-title="common.playPause"`

---

### 2. **导航区域** (2处，需要验证翻译键)

#### ⚠️ Line 315 - 桌面端"进入平台"按钮
```html
<a href="./mall/" class="px-6 py-2 ..." data-i18n="homepage.nav.enter">
  进入平台
</a>
```
**状态：** ⚠️ 需要验证  
**问题：** 有 `data-i18n="homepage.nav.enter"` 属性，但需要验证：
1. 翻译键 `homepage.nav.enter` 是否存在于所有语言包？
2. 翻译是否正确？
**检查：** 需要检查语言包中是否有 `homepage.nav.enter` 键

---

#### ⚠️ Line 341 - 移动端"进入平台"按钮
```html
<a href="./mall/" class="block px-6 py-3 ..." data-i18n="homepage.nav.enter">
  进入平台
</a>
```
**状态：** ⚠️ 需要验证  
**问题：** 同上，需要验证翻译键是否存在

---

### 3. **DAO 治理独立卡片** (2处硬编码段落)

#### ❌ Line 477 - 第一段描述
```html
<p class="text-gray-400 leading-relaxed text-sm sm:text-base mb-6">
  文化保护不再是少数人的使命，而是全球社区的共识。
  采用 <strong class="text-white" data-i18n="homepage.dao.description">DAO 去中心化自治</strong> 模式，
  持有 <span class="text-[#D4AF37] font-semibold">$QI</span> 就是 
  <span class="text-white" data-i18n="homepage.dao.keyPhrase">参与未来传承的钥匙</span> — 
  你的每一票，都在决定哪些文化值得被永续守护
</p>
```
**状态：** ❌ 未翻译  
**问题：** 
- `文化保护不再是少数人的使命，而是全球社区的共识。` - **没有 data-i18n**
- `你的每一票，都在决定哪些文化值得被永续守护` - **没有 data-i18n**

**修复：**
```html
<p class="text-gray-400 leading-relaxed text-sm sm:text-base mb-6">
  <span data-i18n="homepage.dao.intro1">文化保护不再是少数人的使命，而是全球社区的共识。</span>
  采用 <strong class="text-white" data-i18n="homepage.dao.description">DAO 去中心化自治</strong> 模式，
  持有 <span class="text-[#D4AF37] font-semibold">$QI</span> 就是 
  <span class="text-white" data-i18n="homepage.dao.keyPhrase">参与未来传承的钥匙</span> — 
  <span data-i18n="homepage.dao.intro2">你的每一票，都在决定哪些文化值得被永续守护</span>
</p>
```

---

### 4. **Ecosystem 生态系统卡片** (11处)

#### ❌ Line 658 - 匠人中心标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  匠人中心
  <span class="ml-2 text-xs px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full" data-i18n="homepage.ecosystem.feature1Badge">AI 对话</span>
</h3>
```
**状态：** ❌ 未翻译  
**问题：** `匠人中心` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.artisanCenter"`

---

#### ❌ Line 663 - 匠人中心描述补充
```html
<p class="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
  <span class="text-white" data-i18n="homepage.ecosystem.feature1Desc">每位匠人都有 AI 分身，随时回答你的问题。</span>
  从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动
</p>
```
**状态：** ❌ 未翻译  
**问题：** `从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.feature1Desc2"`

---

#### ❌ Line 666 - 匠人中心按钮文本
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  与匠人对话 <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**状态：** ❌ 未翻译  
**问题：** `与匠人对话` - **没有 data-i18n**（注意：Line 427有data-i18n，但这里没有）  
**修复：** 添加 `data-i18n="homepage.ecosystem.talkToArtisan"`

---

#### ❌ Line 676 - 链上真品馆标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  链上真品馆
  <span class="ml-2 text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full">NFT</span>
</h3>
```
**状态：** ❌ 未翻译  
**问题：** `链上真品馆` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.authenticGallery"`

---

#### ❌ Line 681 - 链上真品馆描述补充
```html
<p class="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
  <span class="text-white" data-i18n="homepage.ecosystem.feature2Desc">每件作品都有唯一 NFT 凭证。</span>
  假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆
</p>
```
**状态：** ❌ 未翻译  
**问题：** `假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.feature2Desc2"`

---

#### ❌ Line 684 - 链上真品馆按钮文本（第一个出现）
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  探索藏品 <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**状态：** ❌ 未翻译  
**问题：** `探索藏品` - **没有 data-i18n**（这个在不同位置出现了2次）  
**修复：** 添加 `data-i18n="homepage.ecosystem.exploreCollection"`

---

#### ❌ Line 694 - 参与证明标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  参与证明
  <span class="ml-2 text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">POAP</span>
</h3>
```
**状态：** ❌ 未翻译  
**问题：** `参与证明` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.participationProof"`

---

#### ❌ Line 701 - 参与证明按钮文本
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  铭刻参与 <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**状态：** ❌ 未翻译  
**问题：** `铭刻参与` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.inscribeParticipation"`

---

#### ❌ Line 711 - DAO 治理卡片标题
```html
<h3 class="text-lg sm:text-xl font-bold mb-3 text-white">
  全球共治
  <span class="ml-2 text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full">DAO</span>
</h3>
```
**状态：** ❌ 未翻译  
**问题：** `全球共治` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.globalGovernance"`

---

#### ❌ Line 718 - DAO 治理卡片按钮文本
```html
<div class="text-[#D4AF37] text-xs sm:text-sm font-medium group-hover:text-white transition">
  加入 DAO <i class="fas fa-arrow-right ml-2"></i>
</div>
```
**状态：** ❌ 未翻译  
**问题：** `加入 DAO` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.ecosystem.joinDAO"`

---

#### ⚠️ Line 461 - Platform 区域"探索藏品"按钮
```html
<a href="./mall/" class="inline-block text-[#D4AF37] hover:text-white font-medium text-base transition">
  探索藏品 <i class="fas fa-arrow-right ml-2"></i>
</a>
```
**状态：** ❌ 未翻译  
**问题：** `探索藏品` - **没有 data-i18n**（与Line 684相同）  
**修复：** 添加 `data-i18n="homepage.ecosystem.exploreCollection"`

---

### 5. **Tech 技术栈区域** (2处)

#### ❌ Line 732 - 技术栈标签
```html
<span class="text-[#D4AF37] text-xs sm:text-sm font-bold uppercase tracking-wider">
  <i class="fas fa-layer-group mr-2"></i>技术栈
</span>
```
**状态：** ❌ 未翻译  
**问题：** `技术栈` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.tech.label"`

---

#### ❌ Line 741 - 技术栈描述补充
```html
<p class="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
  <span data-i18n="homepage.tech.title">融合 AI、区块链、Web3</span>
  <span class="text-[#D4AF37] font-semibold" data-i18n="homepage.ecosystem.techLabel1">区块链</span>、
  <span class="text-[#D4AF37] font-semibold" data-i18n="homepage.ecosystem.techLabel2">去中心化存储</span> 
  等前沿技术，打造安全可靠的文化保护平台
</p>
```
**状态：** ❌ 未翻译  
**问题：** `等前沿技术，打造安全可靠的文化保护平台` - **没有 data-i18n**  
**修复：** 添加 `data-i18n="homepage.tech.desc"`

---

## 📊 完整问题统计表

| 序号 | 行号 | 中文文本 | 类型 | 状态 |
|------|------|---------|------|------|
| 1 | 376 | 开启/关闭声音 | Title 属性 | ❌ |
| 2 | 379 | 播放/暂停 | Title 属性 | ❌ |
| 3 | 315 | 进入平台 | 按钮文本 | ⚠️ 需验证翻译键 |
| 4 | 341 | 进入平台 | 按钮文本 | ⚠️ 需验证翻译键 |
| 5 | 477 | 文化保护不再是少数人的使命，而是全球社区的共识。 | 段落文本 | ❌ |
| 6 | 481 | 你的每一票，都在决定哪些文化值得被永续守护 | 段落文本 | ❌ |
| 7 | 461 | 探索藏品 | 按钮文本 | ❌ |
| 8 | 658 | 匠人中心 | 标题 | ❌ |
| 9 | 663 | 从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动 | 描述补充 | ❌ |
| 10 | 666 | 与匠人对话 | 按钮文本 | ❌ |
| 11 | 676 | 链上真品馆 | 标题 | ❌ |
| 12 | 681 | 假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆 | 描述补充 | ❌ |
| 13 | 684 | 探索藏品 | 按钮文本 | ❌ |
| 14 | 694 | 参与证明 | 标题 | ❌ |
| 15 | 701 | 铭刻参与 | 按钮文本 | ❌ |
| 16 | 711 | 全球共治 | 标题 | ❌ |
| 17 | 718 | 加入 DAO | 按钮文本 | ❌ |
| 18 | 732 | 技术栈 | 标签文本 | ❌ |
| 19 | 741 | 等前沿技术，打造安全可靠的文化保护平台 | 描述补充 | ❌ |

**总计：** **19 处未翻译中文文本**

---

## 📋 需要添加的翻译键清单

### 优先级 P0（高优先级）
1. `common.toggleSound` - "开启/关闭声音"
2. `common.playPause` - "播放/暂停"
3. `homepage.ecosystem.artisanCenter` - "匠人中心"
4. `homepage.ecosystem.authenticGallery` - "链上真品馆"
5. `homepage.ecosystem.participationProof` - "参与证明"
6. `homepage.ecosystem.globalGovernance` - "全球共治"
7. `homepage.ecosystem.talkToArtisan` - "与匠人对话"
8. `homepage.ecosystem.exploreCollection` - "探索藏品"
9. `homepage.ecosystem.inscribeParticipation` - "铭刻参与"
10. `homepage.ecosystem.joinDAO` - "加入 DAO"
11. `homepage.tech.label` - "技术栈"

### 优先级 P1（中优先级）
12. `homepage.dao.intro1` - "文化保护不再是少数人的使命，而是全球社区的共识。"
13. `homepage.dao.intro2` - "你的每一票，都在决定哪些文化值得被永续守护"
14. `homepage.ecosystem.feature1Desc2` - "从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动"
15. `homepage.ecosystem.feature2Desc2` - "假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆"
16. `homepage.tech.desc` - "等前沿技术，打造安全可靠的文化保护平台"

### 需要验证的翻译键
17. `homepage.nav.enter` - "进入平台"（需要检查是否存在于所有语言包）

**总计：** **17 个翻译键需要添加或验证**

---

## 🎯 问题分类

### 按类型分类
- **Title 属性：** 2 处
- **段落文本：** 5 处（DAO 治理 2 处 + Ecosystem 描述补充 3 处）
- **标题文本：** 4 处（Ecosystem 卡片标题 + Tech 标签）
- **按钮文本：** 6 处（Ecosystem 按钮）
- **导航按钮：** 2 处（需要验证翻译键）

### 按区域分类
- **DAO 治理卡片：** 2 处段落
- **Ecosystem 生态系统：** 11 处（标题 4 + 描述 3 + 按钮 4）
- **Tech 技术栈：** 2 处
- **导航区域：** 2 处（需验证）
- **视频控制：** 2 处（Title 属性）

---

## 💡 修复优先级

### 🔴 P0 - 立即修复（主要展示区域）
1. ✅ Line 658: 匠人中心标题
2. ✅ Line 676: 链上真品馆标题
3. ✅ Line 694: 参与证明标题
4. ✅ Line 711: 全球共治标题
5. ✅ Line 666, 684, 701, 718: 所有按钮文本
6. ✅ Line 732: 技术栈标签

### 🟡 P1 - 优先修复（补充说明）
7. ✅ Line 376, 379: Title 属性
8. ✅ Line 477, 481: DAO 治理段落
9. ✅ Line 663, 681: Ecosystem 描述补充
10. ✅ Line 741: Tech 描述补充

### ⚠️ P2 - 需要验证
11. ⚠️ Line 315, 341: "进入平台"按钮（需验证翻译键是否存在）

---

## 📝 修复建议

### 修复步骤

1. **为所有未翻译的文本添加 `data-i18n` 属性**
   - Title 属性使用 `data-i18n-title`
   - 普通文本使用 `data-i18n`
   - HTML 内容使用 `data-i18n-html`

2. **为所有翻译键添加到 7 种语言包**
   - 中文（zh.json）
   - 英文（en.json）
   - 日文（ja.json）
   - 法文（fr.json）
   - 西班牙文（es.json）
   - 俄文（ru.json）
   - 马来文（ms.json）

3. **验证现有翻译键**
   - 检查 `homepage.nav.enter` 是否存在于所有语言包
   - 确保所有翻译键都有对应的翻译

4. **测试验证**
   - 切换到英文，检查所有文本是否已翻译
   - 检查其他 6 种语言是否正常显示

---

## ✅ 完成修复后的预期效果

修复完成后：
- ✅ 所有中文文本都有对应的 `data-i18n` 属性
- ✅ 所有翻译键都存在于 7 种语言包中
- ✅ 切换到英文时，所有文本显示为英文
- ✅ 切换到其他语言时，所有文本正确翻译
- ✅ **0 处硬编码中文文本**

---

## 📊 修复工作量估算

| 项目 | 数量 | 预估时间 |
|------|------|----------|
| 添加 data-i18n 属性 | 19 处 | 30 分钟 |
| 添加翻译键到语言包 | 17 键 × 7 语言 | 1 小时 |
| 验证和测试 | - | 15 分钟 |
| **总计** | - | **~2 小时** |

---

**修复完成后，英文页面将不再显示任何中文文本！** ✅

