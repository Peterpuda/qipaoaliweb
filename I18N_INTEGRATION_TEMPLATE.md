# i18n 集成模板

## 标准集成步骤

### 1. 在 `<head>` 中添加 i18n 脚本

```html
<!-- i18n -->
<script src="/i18n/index.js"></script>
<script src="/common/i18n-helper.js"></script>
```

### 2. 添加语言切换器容器

在导航栏或顶部添加：
```html
<div id="languageSwitcher"></div>
```

### 3. 为文本元素添加 data-i18n 属性

```html
<!-- 普通文本 -->
<h1 data-i18n="mall.title">非遗商城</h1>

<!-- 占位符 -->
<input data-i18n-placeholder="mall.searchPlaceholder" placeholder="搜索...">

<!-- 标题 -->
<button data-i18n-title="common.search" title="搜索">

<!-- HTML 内容 -->
<div data-i18n-html="mall.subtitle"></div>
```

### 4. 在页面加载时初始化 i18n

```javascript
window.addEventListener('DOMContentLoaded', async () => {
  // 初始化 i18n
  await initI18n({
    autoDetect: true,
    translateOnInit: true,
    createSwitcher: true,
    switcherContainerId: 'languageSwitcher',
    switcherOptions: {
      showFlag: true,
      showText: false,
      style: 'dropdown'
    }
  });
  
  // 其他初始化代码...
});
```

### 5. 常用翻译 key 映射

| 中文 | Key |
|------|-----|
| 首页 | common.home |
| 商城 | common.mall |
| 购物车 | common.cart |
| 我的 | common.profile |
| 搜索 | common.search |
| 加载中 | common.loading |
| 确认 | common.confirm |
| 取消 | common.cancel |
| 保存 | common.save |
| 删除 | common.delete |
| 立即购买 | mall.buyNow |
| 加入购物车 | mall.addToCart |
| 查看更多 | common.viewMore |
| 热门商品 | mall.hotProducts |
| 新品上架 | mall.newProducts |
| 链上认证 | mall.certified |
| 连接钱包 | wallet.connect |
| 我的订单 | profile.orders |
| 积分 | profile.points |
| 奖励 | profile.rewards |

