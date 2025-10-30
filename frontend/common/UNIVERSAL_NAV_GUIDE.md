# 通用导航栏使用指南

## 📖 简介

`universal-nav.js` 是一个统一的顶部导航栏组件，为所有页面提供一致的导航体验。

## ✨ 特性

- ✅ **固定顶部导航** - 始终可见，不随页面滚动
- ✅ **智能返回** - 自动返回上一页或主页
- ✅ **一键回主页** - Logo 点击直达首页
- ✅ **钱包连接** - 内置 MetaMask 连接功能
- ✅ **响应式设计** - 自动适配移动端
- ✅ **自定义按钮** - 支持添加自定义操作
- ✅ **自动路径计算** - 无需手动配置路径深度

## 🚀 快速开始

### 方法 1: 自动初始化（推荐）

在 HTML 的 `<html>` 标签添加 `data-auto-nav` 属性:

```html
<!DOCTYPE html>
<html lang="zh-CN" data-auto-nav>
<head>
  <meta charset="UTF-8">
  <title>我的页面</title>
</head>
<body>
  <!-- 页面内容 -->
  
  <script src="../common/universal-nav.js"></script>
</body>
</html>
```

### 方法 2: 手动初始化

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的页面</title>
</head>
<body>
  <!-- 页面内容 -->
  
  <script src="../common/universal-nav.js"></script>
  <script>
    // 页面加载完成后初始化
    window.addEventListener('DOMContentLoaded', () => {
      window.UniversalNav.init({
        title: '我的页面',
        subtitle: '页面描述'
      });
    });
  </script>
</body>
</html>
```

## ⚙️ 配置选项

### 完整配置示例

```javascript
window.UniversalNav.init({
  // 页面标题
  title: '商品详情',
  
  // 副标题
  subtitle: '查看商品信息',
  
  // 显示返回按钮
  showBackButton: true,
  
  // 显示主页按钮（Logo）
  showHomeButton: true,
  
  // 显示钱包连接按钮
  showWalletButton: true,
  
  // Logo 图标（Font Awesome 类名）
  logoIcon: 'fa-chess-rook',
  
  // 主页路径（相对路径）
  homePath: '../index.html',
  
  // 自定义按钮
  customButtons: [
    {
      text: '分享',
      icon: 'fa-share',
      onClick: 'shareProduct()'
    },
    {
      text: '收藏',
      icon: 'fa-heart',
      onClick: 'toggleFavorite()'
    }
  ]
});
```

### 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | String | '非遗上链' | 页面标题 |
| `subtitle` | String | '传承千年工艺' | 页面副标题 |
| `showBackButton` | Boolean | true | 是否显示返回按钮 |
| `showHomeButton` | Boolean | true | 是否显示主页按钮 |
| `showWalletButton` | Boolean | true | 是否显示钱包按钮 |
| `logoIcon` | String | 'fa-chess-rook' | Logo 图标类名 |
| `homePath` | String | '../index.html' | 主页路径 |
| `customButtons` | Array | [] | 自定义按钮数组 |

## 📱 移动端适配

导航栏会自动适配移动端:
- 按钮文字在小屏幕自动隐藏
- 保持图标显示
- 触控区域优化

CSS 媒体查询:
```css
@media (max-width: 640px) {
  /* 隐藏按钮文字，只显示图标 */
  .nav-btn-text {
    display: none;
  }
}
```

## 🎨 样式自定义

### 修改主题色

编辑 `universal-nav.js` 中的配置:

```javascript
const NAV_CONFIG = {
  primaryColor: '#9E2A2B',  // 主题色
  lineColor: '#D5BDAF',      // 边框色
  paperColor: '#F9F6F0',     // 背景色
  inkColor: '#2D2A26'        // 文字色
};
```

### 自定义样式

通过 CSS 覆盖默认样式:

```css
#universal-nav {
  /* 自定义导航栏样式 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

#universal-nav button {
  /* 自定义按钮样式 */
}
```

## 🔌 事件监听

### 导航栏就绪事件

```javascript
window.addEventListener('universalNavReady', (e) => {
  console.log('导航栏已初始化', e.detail.options);
});
```

### 钱包连接事件

```javascript
window.addEventListener('walletConnected', (e) => {
  console.log('钱包已连接', e.detail.address);
  // 执行业务逻辑
  loadUserData(e.detail.address);
});
```

### MetaMask 账户变化

```javascript
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    console.log('账户已切换', accounts[0]);
  });
}
```

## 📦 完整示例

### 示例 1: 商品详情页

```html
<!DOCTYPE html>
<html lang="zh-CN" data-auto-nav>
<head>
  <meta charset="UTF-8">
  <title>商品详情 - 非遗上链</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <!-- 页面内容 -->
  <div style="padding: 80px 20px 20px;">
    <h1>宋锦围巾</h1>
    <p>传承千年的织造工艺...</p>
  </div>
  
  <script src="../common/universal-nav.js"></script>
  <script>
    // 自定义配置（可选）
    window.UniversalNav.init({
      title: '商品详情',
      subtitle: '查看商品信息',
      customButtons: [
        {
          text: '分享',
          icon: 'fa-share',
          onClick: 'alert("分享功能")'
        }
      ]
    });
  </script>
</body>
</html>
```

### 示例 2: 匠人中心

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>匠人中心 - 非遗上链</title>
</head>
<body>
  <div style="padding: 80px 20px 20px;">
    <!-- 页面内容 -->
  </div>
  
  <script src="../common/universal-nav.js"></script>
  <script>
    window.UniversalNav.init({
      title: '匠人中心',
      subtitle: '传承千年工艺',
      logoIcon: 'fa-user-tie',
      customButtons: [
        {
          text: '搜索',
          icon: 'fa-search',
          onClick: 'openSearchModal()'
        },
        {
          text: '筛选',
          icon: 'fa-filter',
          onClick: 'openFilterModal()'
        }
      ]
    });
  </script>
</body>
</html>
```

### 示例 3: 管理后台

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>管理后台 - 非遗上链</title>
</head>
<body>
  <div style="padding: 80px 20px 20px;">
    <!-- 后台内容 -->
  </div>
  
  <script src="../common/universal-nav.js"></script>
  <script>
    window.UniversalNav.init({
      title: '管理后台',
      subtitle: '系统管理',
      logoIcon: 'fa-cog',
      showWalletButton: true, // 管理员需要钱包验证
      customButtons: [
        {
          text: '退出',
          icon: 'fa-sign-out-alt',
          onClick: 'logout()'
        }
      ]
    });
  </script>
</body>
</html>
```

## 🔧 高级用法

### 动态更新导航栏

```javascript
// 更新钱包按钮状态
const walletBtn = document.getElementById('universal-wallet-btn');
if (walletBtn) {
  walletBtn.querySelector('.nav-btn-text').textContent = '0x1234...5678';
}

// 添加新按钮
const nav = document.querySelector('#universal-nav > div > div:last-child');
const newBtn = document.createElement('button');
newBtn.innerHTML = '<i class="fas fa-bell"></i> 通知';
nav.appendChild(newBtn);
```

### 条件显示导航元素

```javascript
// 根据用户角色显示不同按钮
const isAdmin = checkAdminRole();

window.UniversalNav.init({
  title: '个人中心',
  customButtons: isAdmin ? [
    { text: '管理', icon: 'fa-cog', onClick: 'goToAdmin()' }
  ] : []
});
```

## 🐛 常见问题

### Q: 导航栏遮挡页面内容？

A: 组件会自动添加占位符。如果还是被遮挡，在 body 顶部添加 padding:

```css
body {
  padding-top: 64px;
}
```

### Q: 如何禁用钱包连接？

A: 设置 `showWalletButton: false`:

```javascript
window.UniversalNav.init({
  showWalletButton: false
});
```

### Q: 如何修改返回逻辑？

A: 编辑 `universal-nav.js` 中的 `showBackButton` 部分:

```javascript
onclick="yourCustomBackFunction()"
```

### Q: Font Awesome 图标不显示？

A: 组件会自动加载 Font Awesome。如果不显示，手动添加:

```html
<link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
```

## 📊 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

## 🔄 更新日志

### v1.0.0 (2025-10-30)
- ✨ 初始版本发布
- ✅ 固定顶部导航
- ✅ 智能返回功能
- ✅ 钱包连接集成
- ✅ 响应式设计
- ✅ 自定义按钮支持

## 📝 最佳实践

1. **统一使用** - 所有页面都应该使用统一导航
2. **保持简洁** - 不要添加过多自定义按钮（最多 2-3 个）
3. **语义化标题** - 使用清晰的页面标题和副标题
4. **测试响应式** - 在不同设备上测试导航栏
5. **监听事件** - 利用事件监听实现业务逻辑

## 🔗 相关资源

- Font Awesome 图标: https://fontawesome.com/icons
- MetaMask 文档: https://docs.metamask.io/
- 项目文档: `NAVIGATION_FIX_SUMMARY.md`

## 💡 贡献

如有问题或建议，请联系开发团队。

