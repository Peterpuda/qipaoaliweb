# 🌍 多语言国际化生产计划

## 📋 项目概述

**目标**: 将非遗商城系统扩展为支持 7 种语言的国际化平台

**支持语言**:
1. 🇨🇳 中文 (Chinese - zh)
2. 🇺🇸 英文 (English - en)
3. 🇯🇵 日文 (Japanese - ja)
4. 🇫🇷 法文 (French - fr)
5. 🇪🇸 西班牙语 (Spanish - es)
6. 🇷🇺 俄罗斯语 (Russian - ru)
7. 🇲🇾 马来语 (Malay - ms)

---

## 🎯 核心原则

1. **后端逻辑不变** - 所有 API 保持现有结构
2. **前端完全国际化** - 所有文本内容支持多语言
3. **SEO 友好** - 每种语言独立 URL
4. **性能优化** - 按需加载语言包
5. **易于维护** - 集中管理翻译文件

---

## 📐 技术架构

### 1. 语言切换机制

#### 方案 A: URL 路径前缀（推荐）
```
https://10break.com/zh/mall/          # 中文
https://10break.com/en/mall/          # 英文
https://10break.com/ja/mall/          # 日文
https://10break.com/fr/mall/          # 法文
https://10break.com/es/mall/          # 西班牙语
https://10break.com/ru/mall/          # 俄罗斯语
https://10break.com/ms/mall/          # 马来语
```

**优点**:
- ✅ SEO 友好
- ✅ URL 清晰
- ✅ 易于分享
- ✅ 支持浏览器历史

#### 方案 B: 子域名
```
https://zh.10break.com/mall/
https://en.10break.com/mall/
```

**优点**:
- ✅ 完全独立
- ✅ 易于 CDN 配置

#### 方案 C: Query 参数
```
https://10break.com/mall/?lang=zh
```

**优点**:
- ✅ 实现简单
- ❌ SEO 不友好

**推荐**: 方案 A（URL 路径前缀）

---

### 2. 文件结构

```
frontend/
├── i18n/                           # 国际化配置
│   ├── index.js                    # i18n 初始化
│   ├── locales/                    # 语言包
│   │   ├── zh.json                 # 中文
│   │   ├── en.json                 # 英文
│   │   ├── ja.json                 # 日文
│   │   ├── fr.json                 # 法文
│   │   ├── es.json                 # 西班牙语
│   │   ├── ru.json                 # 俄罗斯语
│   │   └── ms.json                 # 马来语
│   └── config.js                   # 语言配置
├── common/
│   └── i18n-helper.js              # 国际化辅助函数
└── [pages]/                        # 所有页面使用 i18n
```

---

### 3. 语言包结构

#### `zh.json` 示例
```json
{
  "common": {
    "home": "首页",
    "mall": "商城",
    "community": "互动",
    "cart": "购物车",
    "profile": "我的",
    "login": "登录",
    "logout": "退出",
    "search": "搜索",
    "loading": "加载中...",
    "error": "错误",
    "success": "成功"
  },
  "nav": {
    "artisans": "认证匠人",
    "dao": "DAO治理",
    "checkin": "每日签到",
    "rewards": "奖励中心",
    "about": "关于我们"
  },
  "mall": {
    "title": "非遗商城",
    "subtitle": "每一件商品都绑定链上真品凭证",
    "allProducts": "全部商品",
    "hotProducts": "热门商品",
    "newProducts": "新品上架",
    "certified": "链上认证",
    "viewMore": "查看更多",
    "addToCart": "加入购物车",
    "buyNow": "立即购买"
  },
  "product": {
    "price": "价格",
    "stock": "库存",
    "artisan": "传承人",
    "description": "商品描述",
    "culturalStory": "了解文化故事",
    "certified": "已认证",
    "region": "产地"
  },
  "cart": {
    "title": "购物车",
    "empty": "购物车空空如也",
    "selectAll": "全选",
    "total": "合计",
    "checkout": "去结算",
    "quantity": "数量",
    "delete": "删除"
  },
  "profile": {
    "title": "我的",
    "wallet": "钱包",
    "connectWallet": "连接钱包",
    "points": "积分",
    "rewards": "奖励",
    "coupons": "优惠券",
    "orders": "我的订单",
    "pending": "待付款",
    "paid": "待发货",
    "shipped": "待收货",
    "completed": "待评价",
    "refund": "退款/售后"
  },
  "community": {
    "title": "互动中心",
    "post": "发布动态",
    "like": "点赞",
    "comment": "评论",
    "share": "分享",
    "placeholder": "分享你的想法..."
  }
}
```

#### `en.json` 示例
```json
{
  "common": {
    "home": "Home",
    "mall": "Mall",
    "community": "Community",
    "cart": "Cart",
    "profile": "Profile",
    "login": "Login",
    "logout": "Logout",
    "search": "Search",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "nav": {
    "artisans": "Certified Artisans",
    "dao": "DAO Governance",
    "checkin": "Daily Check-in",
    "rewards": "Rewards",
    "about": "About Us"
  },
  "mall": {
    "title": "Heritage Mall",
    "subtitle": "Every item is bound to an on-chain certificate",
    "allProducts": "All Products",
    "hotProducts": "Hot Products",
    "newProducts": "New Arrivals",
    "certified": "Blockchain Certified",
    "viewMore": "View More",
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now"
  },
  "product": {
    "price": "Price",
    "stock": "Stock",
    "artisan": "Artisan",
    "description": "Description",
    "culturalStory": "Cultural Story",
    "certified": "Certified",
    "region": "Region"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "selectAll": "Select All",
    "total": "Total",
    "checkout": "Checkout",
    "quantity": "Quantity",
    "delete": "Delete"
  },
  "profile": {
    "title": "My Profile",
    "wallet": "Wallet",
    "connectWallet": "Connect Wallet",
    "points": "Points",
    "rewards": "Rewards",
    "coupons": "Coupons",
    "orders": "My Orders",
    "pending": "Pending Payment",
    "paid": "Pending Shipment",
    "shipped": "Pending Receipt",
    "completed": "Pending Review",
    "refund": "Refund/After-sales"
  },
  "community": {
    "title": "Community",
    "post": "Post",
    "like": "Like",
    "comment": "Comment",
    "share": "Share",
    "placeholder": "Share your thoughts..."
  }
}
```

---

### 4. i18n 核心代码

#### `frontend/i18n/index.js`
```javascript
// 简单的 i18n 实现
class I18n {
  constructor() {
    this.locale = 'zh'; // 默认语言
    this.fallbackLocale = 'zh'; // 回退语言
    this.messages = {};
    this.loadedLanguages = [];
  }

  // 初始化
  async init(locale = 'zh') {
    this.locale = locale;
    await this.loadLanguage(locale);
  }

  // 加载语言包
  async loadLanguage(locale) {
    if (this.loadedLanguages.includes(locale)) {
      return;
    }

    try {
      const response = await fetch(`/i18n/locales/${locale}.json`);
      const messages = await response.json();
      this.messages[locale] = messages;
      this.loadedLanguages.push(locale);
      console.log(`✅ Loaded language: ${locale}`);
    } catch (error) {
      console.error(`❌ Failed to load language: ${locale}`, error);
    }
  }

  // 切换语言
  async setLocale(locale) {
    if (!this.loadedLanguages.includes(locale)) {
      await this.loadLanguage(locale);
    }
    this.locale = locale;
    localStorage.setItem('preferred_language', locale);
    
    // 触发语言切换事件
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
  }

  // 获取翻译
  t(key, params = {}) {
    const keys = key.split('.');
    let message = this.messages[this.locale];
    
    // 遍历 key 路径
    for (const k of keys) {
      if (message && typeof message === 'object') {
        message = message[k];
      } else {
        message = undefined;
        break;
      }
    }

    // 如果找不到，使用回退语言
    if (message === undefined && this.locale !== this.fallbackLocale) {
      let fallbackMessage = this.messages[this.fallbackLocale];
      for (const k of keys) {
        if (fallbackMessage && typeof fallbackMessage === 'object') {
          fallbackMessage = fallbackMessage[k];
        } else {
          fallbackMessage = undefined;
          break;
        }
      }
      message = fallbackMessage;
    }

    // 如果还是找不到，返回 key
    if (message === undefined) {
      console.warn(`Translation missing: ${key}`);
      return key;
    }

    // 替换参数
    if (typeof message === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        message = message.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
    }

    return message;
  }

  // 获取当前语言
  getLocale() {
    return this.locale;
  }

  // 获取所有支持的语言
  getAvailableLocales() {
    return ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];
  }

  // 获取语言名称
  getLocaleName(locale) {
    const names = {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      fr: 'Français',
      es: 'Español',
      ru: 'Русский',
      ms: 'Bahasa Melayu'
    };
    return names[locale] || locale;
  }

  // 从 URL 检测语言
  detectLocaleFromURL() {
    const path = window.location.pathname;
    const match = path.match(/^\/(zh|en|ja|fr|es|ru|ms)\//);
    return match ? match[1] : null;
  }

  // 从浏览器检测语言
  detectLocaleFromBrowser() {
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.split('-')[0];
    const available = this.getAvailableLocales();
    return available.includes(lang) ? lang : 'zh';
  }

  // 自动检测语言
  autoDetectLocale() {
    // 1. 从 URL 检测
    const urlLocale = this.detectLocaleFromURL();
    if (urlLocale) return urlLocale;

    // 2. 从 localStorage 检测
    const savedLocale = localStorage.getItem('preferred_language');
    if (savedLocale && this.getAvailableLocales().includes(savedLocale)) {
      return savedLocale;
    }

    // 3. 从浏览器检测
    return this.detectLocaleFromBrowser();
  }
}

// 创建全局实例
window.i18n = new I18n();

// 简化的翻译函数
window.t = (key, params) => window.i18n.t(key, params);
```

#### `frontend/common/i18n-helper.js`
```javascript
// 语言切换器组件
function createLanguageSwitcher() {
  const locales = window.i18n.getAvailableLocales();
  const currentLocale = window.i18n.getLocale();
  
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';
  switcher.innerHTML = `
    <button class="lang-btn" id="langBtn">
      <i class="fas fa-globe"></i>
      <span>${window.i18n.getLocaleName(currentLocale)}</span>
      <i class="fas fa-chevron-down"></i>
    </button>
    <div class="lang-dropdown" id="langDropdown" style="display: none;">
      ${locales.map(locale => `
        <button class="lang-option ${locale === currentLocale ? 'active' : ''}" 
                data-locale="${locale}">
          ${getFlagEmoji(locale)} ${window.i18n.getLocaleName(locale)}
        </button>
      `).join('')}
    </div>
  `;
  
  return switcher;
}

// 获取国旗 emoji
function getFlagEmoji(locale) {
  const flags = {
    zh: '🇨🇳',
    en: '🇺🇸',
    ja: '🇯🇵',
    fr: '🇫🇷',
    es: '🇪🇸',
    ru: '🇷🇺',
    ms: '🇲🇾'
  };
  return flags[locale] || '🌍';
}

// 翻译页面
function translatePage() {
  // 翻译所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // 翻译所有带 data-i18n-placeholder 属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // 翻译所有带 data-i18n-title 属性的元素
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
}

// 监听语言切换事件
window.addEventListener('localeChanged', () => {
  translatePage();
});
```

---

## 📅 生产计划

### 阶段 1: 基础设施搭建（第 1-2 周）

#### Week 1: 核心框架
- [ ] **Day 1-2**: 创建 i18n 基础架构
  - 创建 `frontend/i18n/` 目录结构
  - 实现 `I18n` 类
  - 实现语言检测和切换逻辑
  
- [ ] **Day 3-4**: 创建语言包模板
  - 创建 7 种语言的 JSON 文件
  - 定义统一的 key 命名规范
  - 提取现有中文文本作为基础

- [ ] **Day 5-7**: 实现语言切换器
  - 创建语言切换器 UI 组件
  - 实现语言切换逻辑
  - 添加到所有页面的导航栏

#### Week 2: 翻译工具和流程
- [ ] **Day 1-3**: 开发翻译辅助工具
  - 创建文本提取脚本
  - 创建翻译验证脚本
  - 创建翻译进度追踪工具

- [ ] **Day 4-5**: 建立翻译流程
  - 确定翻译服务商（人工/AI）
  - 建立翻译审核流程
  - 创建翻译质量标准

- [ ] **Day 6-7**: 测试和优化
  - 测试语言切换功能
  - 优化加载性能
  - 修复发现的问题

---

### 阶段 2: 核心页面国际化（第 3-5 周）

#### Week 3: 商城系统
- [ ] **Day 1-2**: `/mall/index.html` - 商城首页
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

- [ ] **Day 3-4**: `/product.html` - 商品详情页
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

- [ ] **Day 5-7**: `/mall/cart.html` - 购物车
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

#### Week 4: 用户中心
- [ ] **Day 1-2**: `/mall/profile.html` - 我的页面
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

- [ ] **Day 3-4**: `/orders/index.html` - 订单管理
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

- [ ] **Day 5-7**: `/mall/community.html` - 互动中心
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

#### Week 5: 主页和其他
- [ ] **Day 1-3**: `/index.html` - 主页
  - 提取所有文本
  - 实现 i18n 集成
  - 翻译 7 种语言

- [ ] **Day 4-5**: 其他页面
  - `/artisans/` - 匠人中心
  - `/dao/` - DAO 治理
  - `/checkin/` - 每日签到
  - `/rewards/` - 奖励中心
  - `/about.html` - 关于我们

- [ ] **Day 6-7**: 测试和修复
  - 全面测试所有页面
  - 修复翻译问题
  - 优化用户体验

---

### 阶段 3: 后端支持（第 6 周）

#### Week 6: API 国际化
- [ ] **Day 1-2**: 数据库多语言支持
  - 为商品表添加多语言字段
  - 为匠人表添加多语言字段
  - 数据迁移脚本

- [ ] **Day 3-4**: API 响应国际化
  - API 接受 `Accept-Language` 头
  - 返回对应语言的数据
  - 回退到默认语言

- [ ] **Day 5-7**: 内容管理
  - 管理后台支持多语言编辑
  - 批量翻译工具
  - 翻译状态管理

---

### 阶段 4: 测试和优化（第 7-8 周）

#### Week 7: 全面测试
- [ ] **Day 1-2**: 功能测试
  - 测试所有语言切换
  - 测试所有页面翻译
  - 测试 API 多语言响应

- [ ] **Day 3-4**: 性能测试
  - 测试语言包加载速度
  - 优化首屏加载时间
  - 实现按需加载

- [ ] **Day 5-7**: 兼容性测试
  - 测试不同浏览器
  - 测试不同设备
  - 测试不同网络环境

#### Week 8: 上线准备
- [ ] **Day 1-3**: 最终优化
  - 修复所有已知问题
  - 优化翻译质量
  - 完善文档

- [ ] **Day 4-5**: 部署准备
  - 配置 CDN
  - 配置 SEO
  - 配置分析工具

- [ ] **Day 6-7**: 正式上线
  - 灰度发布
  - 监控和反馈
  - 快速迭代

---

## 💰 成本估算

### 翻译成本
| 语言 | 预估字数 | 单价（人工） | 单价（AI） | 人工成本 | AI 成本 |
|------|---------|-------------|-----------|---------|---------|
| 英文 | 50,000 | ¥0.15/字 | ¥0.01/字 | ¥7,500 | ¥500 |
| 日文 | 50,000 | ¥0.20/字 | ¥0.01/字 | ¥10,000 | ¥500 |
| 法文 | 50,000 | ¥0.18/字 | ¥0.01/字 | ¥9,000 | ¥500 |
| 西班牙语 | 50,000 | ¥0.18/字 | ¥0.01/字 | ¥9,000 | ¥500 |
| 俄罗斯语 | 50,000 | ¥0.20/字 | ¥0.01/字 | ¥10,000 | ¥500 |
| 马来语 | 50,000 | ¥0.15/字 | ¥0.01/字 | ¥7,500 | ¥500 |
| **总计** | 300,000 | - | - | **¥53,000** | **¥3,000** |

### 开发成本
| 项目 | 工时 | 单价 | 成本 |
|------|------|------|------|
| 基础设施搭建 | 80h | ¥200/h | ¥16,000 |
| 页面国际化 | 120h | ¥200/h | ¥24,000 |
| 后端支持 | 40h | ¥200/h | ¥8,000 |
| 测试和优化 | 80h | ¥200/h | ¥16,000 |
| **总计** | 320h | - | **¥64,000** |

### 总成本
- **人工翻译方案**: ¥53,000 + ¥64,000 = **¥117,000**
- **AI 翻译 + 人工校对**: ¥3,000 + ¥10,000 + ¥64,000 = **¥77,000**

**推荐**: AI 翻译 + 人工校对方案

---

## 🛠️ 技术实现细节

### 1. 页面改造示例

#### 改造前（中文硬编码）
```html
<h1>非遗商城</h1>
<p>每一件商品都绑定链上真品凭证</p>
<button>立即购买</button>
```

#### 改造后（i18n）
```html
<h1 data-i18n="mall.title"></h1>
<p data-i18n="mall.subtitle"></p>
<button data-i18n="mall.buyNow"></button>

<script>
  // 页面加载时翻译
  window.addEventListener('DOMContentLoaded', async () => {
    const locale = i18n.autoDetectLocale();
    await i18n.init(locale);
    translatePage();
  });
</script>
```

### 2. 动态内容翻译

#### JavaScript 中使用
```javascript
// 显示提示信息
alert(t('common.success'));

// 带参数的翻译
const message = t('cart.itemAdded', { name: productName });

// 动态创建元素
const button = document.createElement('button');
button.textContent = t('mall.buyNow');
```

### 3. API 响应国际化

#### 后端修改（worker-api/index.js）
```javascript
// 获取请求语言
function getRequestLocale(req) {
  // 1. 从 query 参数
  const url = new URL(req.url);
  const langParam = url.searchParams.get('lang');
  if (langParam) return langParam;
  
  // 2. 从 Accept-Language 头
  const acceptLang = req.headers.get('Accept-Language');
  if (acceptLang) {
    const lang = acceptLang.split(',')[0].split('-')[0];
    return lang;
  }
  
  // 3. 默认中文
  return 'zh';
}

// 商品列表 API
if (pathname === "/products" && req.method === "GET") {
  const locale = getRequestLocale(req);
  
  const rows = await query(env, `
    SELECT
      id,
      COALESCE(title_${locale}, title_zh) as title,
      COALESCE(desc_${locale}, desc_md) as description,
      price_native,
      price_currency,
      ...
    FROM products
  `);
  
  return jsonResponse({ ok: true, products: rows });
}
```

---

## 📊 进度追踪

### 翻译进度表
| 模块 | 中文 | 英文 | 日文 | 法文 | 西班牙语 | 俄罗斯语 | 马来语 |
|------|------|------|------|------|---------|---------|--------|
| 通用 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 导航 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 商城首页 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 商品详情 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 购物车 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 我的页面 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 互动中心 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| 主页 | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

图例: ✅ 完成 | ⏳ 进行中 | ⏸️ 待开始 | ❌ 有问题

---

## 🎯 质量标准

### 翻译质量
1. **准确性**: 翻译准确，无歧义
2. **流畅性**: 符合目标语言习惯
3. **一致性**: 术语翻译统一
4. **完整性**: 无遗漏翻译
5. **文化适应**: 考虑文化差异

### 技术质量
1. **性能**: 语言切换 < 100ms
2. **兼容性**: 支持所有主流浏览器
3. **可维护性**: 代码清晰，易于维护
4. **可扩展性**: 易于添加新语言
5. **SEO**: 每种语言独立索引

---

## 🚀 上线策略

### 灰度发布
1. **阶段 1**: 10% 用户（1周）
2. **阶段 2**: 30% 用户（1周）
3. **阶段 3**: 50% 用户（1周）
4. **阶段 4**: 100% 用户

### 监控指标
- 语言切换成功率
- 页面加载时间
- 用户留存率
- 转化率变化
- 错误率

---

## 📝 后续维护

### 日常维护
- 每周检查翻译问题反馈
- 每月更新翻译内容
- 每季度优化翻译质量

### 内容更新流程
1. 开发添加新文本（中文）
2. 提取到语言包
3. 发送给翻译团队
4. 审核翻译质量
5. 部署上线

---

## 🎊 预期效果

### 用户增长
- 🌍 **覆盖全球市场**: 7 种语言覆盖 80% 互联网用户
- 📈 **用户增长**: 预计增长 300-500%
- 🎯 **转化率提升**: 本地化语言提升 50-100% 转化率

### 品牌影响
- 🌟 **国际化形象**: 提升品牌国际化水平
- 🤝 **文化交流**: 促进非遗文化国际传播
- 💼 **商业机会**: 开拓国际市场

---

## 📞 联系方式

**项目负责人**: [待定]  
**翻译团队**: [待定]  
**技术支持**: AI Assistant

---

**文档版本**: v1.0  
**创建日期**: 2025-10-31  
**预计完成**: 2025-12-31（8周）

---

## ✅ 下一步行动

1. **立即开始**: 创建 i18n 基础架构
2. **确定预算**: 选择翻译方案（AI + 人工）
3. **组建团队**: 招募翻译和开发人员
4. **启动项目**: 按照计划执行

**准备好开始了吗？** 🚀

