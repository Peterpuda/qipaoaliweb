# 🌍 多语言最终任务清单

## 📋 发现的问题（从截图分析）

### 图1 - DAO 区域
❌ **硬编码中文：**
```
- "文化保护不再是少数人的使命，而是全球社区的共识。"
- "采用 Powered by DAO decentralized governance, holding $QI is your key to shaping heritage 模式，持有 $QI 就是"
- "homepage.dao.keyPhrase — 你的每一票，都在决定哪些文化值得被永续守护"
```

### 图2 - Ecosystem 区域
❌ **硬编码中文：**
```
- "从线下到链上，从对话到永恒"
- "每一个环节，都在构建 文化永续的未来。从匠人的指尖、到全球的钱包"
- "匠人中心"
- "链上真品馆"
- "参与证明"
- "全球共治"
- "与匠人对话"
- "探索藏品"
- "铭刻参与"
- "加入 DAO"
- "从一针的走向，到千年的传承 — 比博物馆更生动"
- "假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆"
- "每次签到、领取 $QI、守护 POAP、每日签到、领取 $QI — 守护文化的每一步，都被永久铭刻"
- "铭刻参与"
- "提案、投票、执行 — 每一票都有力量，每个人都是守护者"
```

### 图3 - Footer 区域
❌ **硬编码中文：**
```
- "融合 Artificial Intelligence 与 Web3 Technology，构建全球非遗文化数字保护生态，实现文化传承、AI 智能导览与 DAO 社区自治。"
- "关于平台"
- "匠人中心"
- "NFT 链商"
- "DAO 治理"
- "奖励中心"
- "白皮书"
- "开发文档"
- "品牌资产"
- "隐私政策"
- "服务条款"
```

### 图4 - Tech 区域
❌ **硬编码中文：**
```
- "区块链、去中心化存储 等前沿技术，打造安全可靠的文化保护平台"
```

### 图5 - Token 区域
❌ **硬编码中文：**
```
- "对哪些非遗项目值得上链、资金如何分配、未来如何发展 — 你的一票决定文化的走向。这不是形式，而是真正的话语权"
- "每日签到、分享故事、创作内容 — 每一次参与都会获得通证奖励。守护文化的过程，也是价值累积的过程"
- "参加线下非遗体验、与 AI 匠人深度对话 — 你的钱包，就是博物馆"
- "合规声明：$QI 为社区功能证，非证券类投资品。不支持二级市场交易或转让。仅用于生态治理和权益访问。"
- "每日签到可领取 1000 $QI"
```

### 图6 - Governance 区域
❌ **硬编码中文：**
```
- "无论你是 热爱传统的文化守护者、手握技艺的传承匠人、Web3 believers in the future，还是 DAO governance innovators"
- "探索匠人世界"
- "成为文化守护者"
- "链上运行"
- "开源透明"
- "永久存储"
```

---

## ✅ 修复任务清单

### 阶段 1: 诊断和定位 (10分钟)
- [x] 运行诊断脚本找出所有未翻译内容
- [ ] 手动检查每个区域的硬编码中文
- [ ] 创建完整的未翻译内容列表

### 阶段 2: 扩展语言包 (1小时)
- [ ] 为 DAO 区域添加缺失的翻译键
- [ ] 为 Ecosystem 区域添加缺失的翻译键
- [ ] 为 Footer 区域添加缺失的翻译键
- [ ] 为 Tech 区域添加缺失的翻译键
- [ ] 为 Token 区域添加缺失的翻译键
- [ ] 为 Governance 区域添加缺失的翻译键
- [ ] 为所有 7 种语言添加本地化翻译

### 阶段 3: 修改 HTML (1小时)
- [ ] 为所有硬编码中文添加 `data-i18n` 属性
- [ ] 处理混合中英文的段落（拆分为多个 span）
- [ ] 确保所有可见文本都有翻译标记

### 阶段 4: 测试验证 (30分钟)
- [ ] 测试中文版本
- [ ] 测试英文版本
- [ ] 测试日文版本
- [ ] 测试法文版本
- [ ] 测试西班牙文版本
- [ ] 测试俄文版本
- [ ] 测试马来文版本

### 阶段 5: 部署 (10分钟)
- [ ] 提交所有更改
- [ ] 部署到 Cloudflare Pages
- [ ] 验证线上版本

---

## 🔍 详细修复计划

### 问题 1: 混合中英文段落

**当前代码：**
```html
<p>
  文化保护不再是少数人的使命，而是全球社区的共识。
  采用 <strong>DAO 去中心化自治</strong> 模式，
  持有 <span>$QI</span> 就是 
  <span>参与未来传承的钥匙</span>
</p>
```

**问题：** 部分中文没有 `data-i18n` 属性

**解决方案：**
```html
<p>
  <span data-i18n="homepage.dao.description1">文化保护不再是少数人的使命，而是全球社区的共识。</span>
  <span data-i18n="homepage.dao.description2">采用</span>
  <strong data-i18n="homepage.dao.daoMode">DAO 去中心化自治</strong>
  <span data-i18n="homepage.dao.description3">模式，持有</span>
  <span>$QI</span>
  <span data-i18n="homepage.dao.description4">就是</span>
  <span data-i18n="homepage.dao.keyPhrase">参与未来传承的钥匙</span>
</p>
```

### 问题 2: 长段落文本

**当前代码：**
```html
<p>
  对哪些非遗项目值得上链、资金如何分配、未来如何发展 — 
  你的一票决定文化的走向。这不是形式，而是真正的话语权
</p>
```

**解决方案：**
```html
<p data-i18n="homepage.token.role1DescFull">
  对哪些非遗项目值得上链、资金如何分配、未来如何发展 — 
  你的一票决定文化的走向。这不是形式，而是真正的话语权
</p>
```

### 问题 3: 列表项文本

**当前代码：**
```html
<a href="#">关于平台</a>
<a href="#">匠人中心</a>
<a href="#">NFT 链商</a>
```

**解决方案：**
```html
<a href="#" data-i18n="homepage.footer.aboutPlatform">关于平台</a>
<a href="#" data-i18n="homepage.footer.artisanCenter">匠人中心</a>
<a href="#" data-i18n="homepage.footer.nftMall">NFT 链商</a>
```

---

## 📝 需要添加的翻译键

### DAO 区域 (15个键)
```javascript
homepage.dao: {
  description1: "文化保护不再是少数人的使命，而是全球社区的共识。",
  description2: "采用",
  daoMode: "DAO 去中心化自治",
  description3: "模式，持有",
  description4: "就是",
  keyPhrase: "参与未来传承的钥匙",
  description5: "你的每一票，都在决定哪些文化值得被永续守护"
}
```

### Ecosystem 区域 (20个键)
```javascript
homepage.ecosystem: {
  mainTitle: "从线下到链上，从对话到永恒",
  subtitle1: "每一个环节，都在构建",
  subtitle2: "从匠人的指尖、到全球的钱包",
  card1Title: "匠人中心",
  card1Badge: "AI Dialogue",
  card1Desc: "从一针的走向，到千年的传承 — 比博物馆更生动",
  card1Cta: "与匠人对话",
  card2Title: "链上真品馆",
  card2Badge: "NFT",
  card2Desc: "假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆",
  card2Cta: "探索藏品",
  card3Title: "参与证明",
  card3Badge: "POAP",
  card3Desc: "每次签到、领取 $QI、守护 POAP — 守护文化的每一步，都被永久铭刻",
  card3Cta: "铭刻参与",
  card4Title: "全球共治",
  card4Badge: "DAO",
  card4Desc: "提案、投票、执行 — 每一票都有力量，每个人都是守护者",
  card4Cta: "加入 DAO"
}
```

### Footer 区域 (15个键)
```javascript
homepage.footer: {
  description: "融合 Artificial Intelligence 与 Web3 Technology，构建全球非遗文化数字保护生态，实现文化传承、AI 智能导览与 DAO 社区自治。",
  aboutPlatform: "关于平台",
  artisanCenter: "匠人中心",
  nftMall: "NFT 链商",
  daoGovernance: "DAO 治理",
  rewardCenter: "奖励中心",
  whitepaper: "白皮书",
  devDocs: "开发文档",
  brandAssets: "品牌资产",
  privacyPolicy: "隐私政策",
  termsOfService: "服务条款"
}
```

### Tech 区域 (5个键)
```javascript
homepage.tech: {
  description: "区块链、去中心化存储 等前沿技术，打造安全可靠的文化保护平台"
}
```

### Token 区域 (10个键)
```javascript
homepage.token: {
  role1DescFull: "对哪些非遗项目值得上链、资金如何分配、未来如何发展 — 你的一票决定文化的走向。这不是形式，而是真正的话语权",
  role2DescFull: "每日签到、分享故事、创作内容 — 每一次参与都会获得通证奖励。守护文化的过程，也是价值累积的过程",
  role3DescFull: "参加线下非遗体验、与 AI 匠人深度对话 — 你的钱包，就是博物馆",
  complianceFull: "合规声明：$QI 为社区功能证，非证券类投资品。不支持二级市场交易或转让。仅用于生态治理和权益访问。",
  dailyReward: "每日签到可领取 1000 $QI"
}
```

### Governance 区域 (10个键)
```javascript
homepage.governance: {
  audienceIntro: "无论你是",
  audienceConnector1: "、",
  audienceConnector2: "，还是",
  exploreWorld: "探索匠人世界",
  becomeGuardian: "成为文化守护者",
  stat1Desc: "链上运行",
  stat2Desc: "开源透明",
  stat3Desc: "永久存储"
}
```

---

## 🎯 预计工作量

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| 诊断定位 | 10分钟 | P0 |
| 扩展语言包（7种语言 × 75个新键） | 2小时 | P0 |
| 修改 HTML（26处） | 1.5小时 | P0 |
| 测试验证（7种语言） | 30分钟 | P0 |
| 部署上线 | 10分钟 | P0 |
| **总计** | **~4.5小时** | - |

---

## 🚀 立即开始

### 优先级排序
1. **P0 - 紧急**：DAO 区域（用户最先看到）
2. **P0 - 紧急**：Token 区域（核心内容）
3. **P0 - 紧急**：Governance 区域（行动号召）
4. **P1 - 重要**：Ecosystem 区域
5. **P1 - 重要**：Footer 区域
6. **P2 - 次要**：Tech 区域

---

## ✅ 成功标准

### 验收标准
- [ ] 所有 7 种语言的所有内容都完全翻译
- [ ] 切换语言后，页面中**没有任何中文残留**（除非选择中文）
- [ ] 切换语言后，页面中**没有任何英文残留**（除非选择英文）
- [ ] 所有翻译都是本地化表达，不是直译
- [ ] 移动端和桌面端都能正常切换语言
- [ ] 页面加载速度不受影响

### 测试清单
```
测试场景 1: 英文用户
- 打开网站 → 选择英文
- 滚动整个页面
- ✅ 确认没有任何中文字符

测试场景 2: 日文用户
- 打开网站 → 选择日文
- 滚动整个页面
- ✅ 确认没有任何中文或英文字符

测试场景 3: 法文用户
- 打开网站 → 选择法文
- 滚动整个页面
- ✅ 确认没有任何中文或英文字符

... 以此类推所有 7 种语言
```

---

## 🔧 开始执行

**现在开始修复！目标：100% 翻译覆盖率，0 硬编码中文！**

